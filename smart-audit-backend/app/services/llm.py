# app/services/llm.py

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from app.llm.free_llm_wrapper import FreeLLMWrapper

llm = FreeLLMWrapper()

prompt_template = PromptTemplate(
    input_variables=["code", "slither_data", "mythril_data"],
    template="""
You are a smart contract auditor.
Here is the Solidity code:
{code}

Slither Results:
{slither_data}

Mythril Results:
{mythril_data}

Give a detailed security summary and a letter grade (A to F).
"""
)

chain = LLMChain(llm=llm, prompt=prompt_template)

def generate_llm_summary(code: str, slither_data: str, mythril_data: str) -> str:
    return chain.run({
        "code": code,
        "slither_data": slither_data,
        "mythril_data": mythril_data
    })
