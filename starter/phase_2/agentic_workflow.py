# agentic_workflow.py
#
# Agentic workflow for technical project management.
#
# This module can be used in two ways:
#   1. As a script (CLI):    python agentic_workflow.py
#      -> reads Product-Spec-Email-Router.txt and prints the plan.
#   2. As a library:         from agentic_workflow import generate_report
#      -> pass a BRD / product spec string and get a structured report back.
#         This is what the web app (server.py) uses so the BRD can be provided
#         from an HTML page and the output rendered back on the page.

import os

from dotenv import load_dotenv
from workflow_agents.base_agents import (
    ActionPlanningAgent,
    EvaluationAgent,
    KnowledgeAugmentedPromptAgent,
    RoutingAgent,
)

# Load the OpenAI key into a variable called openai_api_key.
# Try several common locations so the key can live in tests/.env, a plain
# .env next to this file, or a real environment variable.
load_dotenv("../.env")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Default product spec file used when running as a CLI script.
DEFAULT_SPEC_FILE = "Product-Spec-Email-Router.txt"

# Default high-level workflow prompt (simulating a TPM request).
DEFAULT_WORKFLOW_PROMPT = (
    "Generate a comprehensive project development plan including "
    "user stories with acceptance criteria, product features, "
    "and detailed engineering tasks for this product."
)


# ---------------------------------------------------------------------------
# Knowledge / persona / evaluation-criteria definitions
# ---------------------------------------------------------------------------

knowledge_action_planning = (
    "Stories are defined from a product spec by identifying a "
    "persona, an action, and a desired outcome for each story. "
    "Each story represents a specific functionality of the product "
    "described in the specification. \n"
    "Features are defined by grouping related user stories. \n"
    "Tasks are defined for each story and represent the engineering "
    "work required to develop the product. \n"
    "A development Plan for a product contains all these components"
)

# Product Manager
persona_product_manager = (
    "You are a Senior Product Manager responsible for creating Epics, "
    "User Stories, and Acceptance Criteria from a product specification."
)


def _build_product_manager_knowledge(product_spec):
    """Build the Product Manager knowledge string embedding the product spec."""
    return (
        "Analyze the provided product specification.\n\n"
        "For each major business capability create an Epic.\n\n"
        "Under each Epic create User Stories using the format:\n"
        "As a [persona], I want [goal], so that [business value].\n\n"
        "For each User Story generate Acceptance Criteria using:\n"
        "Given ...\n"
        "When ...\n"
        "Then ...\n\n"
        "The final output should follow this structure:\n"
        "Epic\n"
        "  User Story\n"
        "    Acceptance Criteria\n\n"
        f"Product Specification:\n{product_spec}"
    )


product_evaluation_criteria = """
The response must:
 
1. Create Epics.
 
2. Create User Stories under each Epic.
 
3. Every User Story must follow:
 
As a [persona],
I want [goal],
so that [business value].
 
4. Every User Story must contain Acceptance Criteria.
 
5. Acceptance Criteria must follow:
 
Given ...
When ...
Then ...
 
6. The output hierarchy must be:
 
Epic
  User Story
    Acceptance Criteria
"""
persona_prodct_evaluation = (
    "You are an evaluation agent that checks the answers of other worker agents"
)

# Program Manager
persona_program_manager = "You are a Program Manager, you are responsible for defining the features for a product."
knowledge_program_manager = "Features of a product are defined by organizing similar user stories into cohesive groups."
persona_program_manager_eval = (
    "You are an evaluation agent that checks the answers of other worker agents."
)
program_evaluation_criteria = """
                                The answer should be product features that follow the following structure:  \
                                                    Feature Name: A clear, concise title that identifies the capability\n \
                                                    Description: A brief explanation of what the feature does and its purpose\n \
                                                    Key Functionality: The specific capabilities or actions the feature provides\n \
                                                    User Benefit: How this feature creates value for the user
 
                                """

# Development Engineer
persona_dev_engineer = "You are a Development Engineer, you are responsible for defining the development tasks for a product."
knowledge_dev_engineer = "Development tasks are defined by identifying what needs to be built to implement each user story."
persona_dev_engineer_eval = (
    "You are an evaluation agent that checks the answers of other worker agents."
)
dev_engineer_evaluation_criteria = """
                                    The answer should be tasks following this exact structure:  \
                                                          Task ID: A unique identifier for tracking purposes\n \
                                                          Task Title: Brief description of the specific development work\n \
                                                          Related User Story: Reference to the parent user story\n \
                                                          Description: Detailed explanation of the technical work required\n \
                                                          Acceptance Criteria: Specific requirements that must be met for completion\n \
                                                          Estimated Effort: Time or complexity estimation\n \
                                                          Dependencies: Any tasks that must be completed first
                                   """


# ---------------------------------------------------------------------------
# Agent construction
# ---------------------------------------------------------------------------


class WorkflowAgents:
    """Container holding all instantiated agents for a given product spec."""

    def __init__(self, product_spec, api_key=None):
        api_key = api_key or openai_api_key
        if not api_key:
            raise ValueError(
                "OpenAI API key not found. Set OPENAI_API_KEY (e.g. in tests/.env)."
            )

        self.product_spec = product_spec

        # Action Planning Agent
        self.action_planning_agent = ActionPlanningAgent(
            api_key, knowledge_action_planning
        )

        # Product Manager team
        self.product_manager_knowledge_agent = KnowledgeAugmentedPromptAgent(
            api_key,
            persona_product_manager,
            _build_product_manager_knowledge(product_spec),
        )
        self.product_manager_evaluation_agent = EvaluationAgent(
            api_key,
            persona_prodct_evaluation,
            product_evaluation_criteria,
            self.product_manager_knowledge_agent,
            5,
        )

        # Program Manager team
        self.program_manager_knowledge_agent = KnowledgeAugmentedPromptAgent(
            api_key, persona_program_manager, knowledge_program_manager
        )
        self.program_manager_evaluation_agent = EvaluationAgent(
            api_key,
            persona_program_manager_eval,
            program_evaluation_criteria,
            self.program_manager_knowledge_agent,
            5,
        )

        # Development Engineer team
        self.development_engineer_knowledge_agent = KnowledgeAugmentedPromptAgent(
            api_key, persona_dev_engineer, knowledge_dev_engineer
        )
        self.development_engineer_evaluation_agent = EvaluationAgent(
            api_key,
            persona_dev_engineer_eval,
            dev_engineer_evaluation_criteria,
            self.development_engineer_knowledge_agent,
            5,
        )

        # Routing Agent
        self.routing_agent = RoutingAgent(
            api_key,
            [
                {
                    "name": "Product Manager Agent",
                    "description": "Answer a question about defining the user stories for a product",
                    "func": lambda x: self.product_manager_support_function(x),
                },
                {
                    "name": "Program Manager Agent",
                    "description": "Answer a question about defining the features for a product",
                    "func": lambda x: self.program_manager_support_function(x),
                },
                {
                    "name": "Development Engineer Agent",
                    "description": "Answer a question about defining the development tasks for a product",
                    "func": lambda x: self.development_engineer_support_function(x),
                },
            ],
        )

    # -- Support functions -------------------------------------------------

    def product_manager_support_function(self, prompt):
        """Product Manager: generate then evaluate the response."""
        response = self.product_manager_knowledge_agent.respond(prompt)
        return self.product_manager_evaluation_agent.evaluate(response)

    def program_manager_support_function(self, prompt):
        """Program Manager: generate then evaluate the response."""
        response = self.program_manager_knowledge_agent.respond(prompt)
        return self.program_manager_evaluation_agent.evaluate(response)

    def development_engineer_support_function(self, prompt):
        """Development Engineer: generate then evaluate the response."""
        response = self.development_engineer_knowledge_agent.respond(prompt)
        return self.development_engineer_evaluation_agent.evaluate(response)


# ---------------------------------------------------------------------------
# High level entry points
# ---------------------------------------------------------------------------


def generate_report(product_spec, api_key=None):
    """
    Run the three specialized agent teams over a BRD / product spec and return
    a structured report. This is the function the web app calls so a BRD from
    the HTML page produces output shown back on the page.

    Returns a dict:
        {
          "productManager": {"text": ..., "evaluation": ..., "iterations": ...},
          "programManager": {...},
          "developmentEngineer": {...}
        }
    """
    if not product_spec or not product_spec.strip():
        raise ValueError("The provided BRD / product specification is empty.")

    team = WorkflowAgents(product_spec, api_key=api_key)

    # 1) Product Manager -> Epics, User Stories, Acceptance Criteria
    pm_result = team.product_manager_support_function(
        "Using the product specification, generate Epics, User Stories, and "
        "Acceptance Criteria for this product.\n\n"
        "For each Epic, provide:\n"
        "- Epic ID and Title\n"
        "- Description\n"
        "- User Stories (each with ID, title, description in 'As a... I want... So that...' format)\n"
        "- Acceptance Criteria for each story\n\n"
        "List all epics and their user stories in this structured format."
    )
    pm_text = pm_result["final_response"]

    # 2) Program Manager -> Features (informed by the spec and the user stories)
    pg_result = team.program_manager_support_function(
        "Product Specification:\n"
        f"{product_spec}\n\n"
        "User Stories:\n"
        f"{pm_text}\n\n"
        "Group the related user stories into cohesive product features.\n\n"
        "For each Feature, provide:\n"
        "- Feature ID and Title\n"
        "- Description\n"
        "- Related User Stories\n"
        "- Dependencies\n"
        "- Delivery Milestone\n\n"
        "List all features in this structured format."
    )
    pg_text = pg_result["final_response"]

    # 3) Development Engineer -> Development tasks (informed by stories + features)
    dev_result = team.development_engineer_support_function(
        "Product Specification:\n"
        f"{product_spec}\n\n"
        "Product Features:\n"
        f"{pg_text}\n\n"
        "User Stories:\n"
        f"{pm_text}\n\n"
        "Define the detailed engineering development tasks needed to implement "
        "these user stories and features.\n\n"
        "For EACH task, provide:\n"
        "- Task ID (e.g., TASK-001)\n"
        "- Task Title\n"
        "- Related User Story\n"
        "- Description\n"
        "- Acceptance Criteria\n"
        "- Estimated Effort\n"
        "- Dependencies\n\n"
        "List all tasks in this structured format."
    )
    dev_text = dev_result["final_response"]

    return {
        "productManager": {
            "text": pm_text,
            "evaluation": pm_result.get("evaluation", ""),
            "iterations": pm_result.get("iterations", 0),
        },
        "programManager": {
            "text": pg_text,
            "evaluation": pg_result.get("evaluation", ""),
            "iterations": pg_result.get("iterations", 0),
        },
        "developmentEngineer": {
            "text": dev_text,
            "evaluation": dev_result.get("evaluation", ""),
            "iterations": dev_result.get("iterations", 0),
        },
    }


def run_action_planning_workflow(
    product_spec, workflow_prompt=DEFAULT_WORKFLOW_PROMPT, api_key=None
):
    """
    Original agentic workflow: an Action Planning Agent breaks the prompt into
    steps, and a Routing Agent dispatches each step to the right agent team.
    Returns the list of completed step results.
    """
    team = WorkflowAgents(product_spec, api_key=api_key)

    workflow_steps = team.action_planning_agent.extract_steps_from_prompt(
        workflow_prompt
    )

    completed_steps = []
    for step in workflow_steps:
        print(f"Executing step: {step}")
        routing_result = team.routing_agent.route(step)
        completed_steps.append(routing_result)
        print(f"Result of step '{step}' :: {routing_result}\n")

    return completed_steps


def _load_default_spec():
    """Load the default product spec file for CLI usage."""
    with open(DEFAULT_SPEC_FILE, "r", encoding="utf-8") as file:
        return file.read()


def main():
    """CLI entry point: run all three agent teams and print their outputs."""
    product_spec = _load_default_spec()

    print("\n*** Workflow execution started ***\n")

    report = generate_report(product_spec)

    sections = [
        ("PRODUCT MANAGER", "productManager"),
        ("PROGRAM MANAGER", "programManager"),
        ("DEVELOPMENT ENGINEER", "developmentEngineer"),
    ]
    for title, key in sections:
        agent = report[key]
        print("\n" + "=" * 70)
        print(title)
        print("=" * 70)
        print(agent["text"])
        print(f"\n[evaluation iterations: {agent.get('iterations', 0)}]")

    print("\n*** Workflow execution completed ***\n")


if __name__ == "__main__":
    main()
