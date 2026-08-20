# Test script for DirectPromptAgent class

from workflow_agents.base_agents import DirectPromptAgent # TODO: 1 - Import the DirectPromptAgent class from BaseAgents
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file

# TODO: 2 - Load the OpenAI API key from the environment variables
load_dotenv("../.env")
api_key = os.getenv("OPENAI_API_KEY")

prompt = "What is the Capital of France?"

# TODO: 3 - Instantiate the DirectPromptAgent as direct_agent
direct_agent = DirectPromptAgent(api_key)
# TODO: 4 - Use direct_agent to send the prompt defined above and store the response
direct_agent_response = direct_agent.respond(prompt)

# Print the response from the agent
print(direct_agent_response)

# TODO: 5 - Print an explanatory message describing the knowledge source used by the agent to generate the response
print("The DirectPromptAgent responses above are general based on gpt-3.5-turbo model")
