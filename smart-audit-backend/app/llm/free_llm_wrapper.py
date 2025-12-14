# app/llm/free_llm_wrapper.py

import requests, os, json
from typing import Optional, List
from langchain.llms.base import LLM


class FreeLLMWrapper(LLM):
    model: str = "mistralai/mistral-7b-instruct:free"
    api_key: str = os.getenv("OPENROUTER_API_KEY")
    site_url: str = "http://localhost:8000"  # Used in HTTP-Referer
    site_title: str = "SmartAudit"           # Used in X-Title

    @property
    def _llm_type(self) -> str:
        return "openrouter"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in environment")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_title,
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}]
        }

        try:
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload),
                timeout=30
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

        except requests.exceptions.HTTPError as e:
            raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
        except Exception as e:
            raise Exception(f"Request failed: {str(e)}")
