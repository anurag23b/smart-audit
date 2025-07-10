# app/llm/free_llm_wrapper.py

from langchain_core.language_models.llms import LLM
import requests

class FreeLLMWrapper(LLM):
    """LangChain-compatible wrapper for a free LLM via OpenRouter API."""

    @property
    def _llm_type(self) -> str:
        return "free-llm-wrapper"

    def _call(self, prompt: str, stop: list[str] = None) -> str:
        try:
            headers = {
                "Authorization": "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",  # Replace with actual key
                "HTTP-Referer": "https://your-project-name.com",
                "X-Title": "Smart Audit Platform",
                "Content-Type": "application/json"
            }

            payload = {
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [{"role": "user", "content": prompt}]
            }

            response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

        except Exception as e:
            return f"Error from LLM: {e}"
