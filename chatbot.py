import os
import asyncio
from llama_index.core.llms import ChatMessage
from llama_index.llms.google_genai import GoogleGenAI

# NOTE: For security, you should load API keys from environment variables 
# and not hardcode them in the source file.
os.environ["GOOGLE_API_KEY"] = "API_KEY" 

async def get_response(user_input: str):
    messages = [
        ChatMessage(role="system", content="You are a Python expert.But use tokens upto 80-100 tokens and be crisp while providing the response for given Queries. strictly, dont provide unnecessary informtaions."),
        ChatMessage(role="user", content=user_input)
    ]
    llm = GoogleGenAI(model="gemini-2.5-flash")
    resp = await llm.achat(messages)
    return resp.message.content


# Synchronous wrapper for FastAPI - (kept commented as it's not needed with the main.py fix)
# def get_response(user_input: str):
#     return asyncio.run(chat_with_llm(user_input))