# ✅ FIXED `services/llm.py` using new `openai` SDK (>=1.0.0)
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

def generate_llm_summary(source_code: str, slither_data, mythril_data):
    prompt = f"""
You are a smart contract security auditor. Given the Solidity code and the results from Slither and Mythril, provide:
1. A security grade (A+ to F)
2. A human-readable audit summary
3. Vulnerability descriptions and suggestions

Contract:
{source_code[:1500]}

Slither:
{str(slither_data)[:1000]}

Mythril:
{str(mythril_data)[:1000]}
"""
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct",
            messages=[
                {"role": "system", "content": "You are an expert smart contract security auditor."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error with OpenRouter LLM: {str(e)}"
