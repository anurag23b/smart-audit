# app/services/llm.py

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from app.llm.free_llm_wrapper import FreeLLMWrapper
import json

llm = FreeLLMWrapper()

prompt_template = PromptTemplate(
    input_variables=["code", "slither_data", "mythril_data", "analysis_status"],
    template="""
You are a smart contract security auditor.

Analysis Status:
{analysis_status}

Solidity Code:
{code}

Slither Results:
{slither_data}

Mythril Results:
{mythril_data}

Instructions:
- If analysis tools failed, clearly state that results are limited and recommend manual review.
- Do NOT suggest replacing payable(msg.sender).transfer with address(msg.sender).transfer; they are equivalent.
- Emphasize proper reentrancy mitigations: Checks-Effects-Interactions, pull-payment patterns, and using call{{value: amount}}("") with success checks.
- Focus on actual issues found (from tool outputs), avoid hypothetical/non-evidenced issues.
- Provide a concise security summary and actionable recommendations.

Provide a comprehensive security assessment.
"""
)

chain = LLMChain(llm=llm, prompt=prompt_template)

def generate_llm_summary(code: str, slither_data: str, mythril_data: str) -> str:
    """
    Generate LLM summary with awareness of analysis tool failures.
    """
    try:
        # Parse reports to check success
        slither_report = json.loads(slither_data) if isinstance(slither_data, str) else slither_data
        mythril_report = json.loads(mythril_data) if isinstance(mythril_data, str) else mythril_data
        
        slither_success = slither_report.get("success", False)
        mythril_success = mythril_report.get("success", False)
        
        slither_issues = slither_report.get("issues", [])
        mythril_issues = mythril_report.get("issues", [])
        
        # Build status message
        if slither_success and mythril_success:
            analysis_status = f"✅ Both Slither and Mythril completed. Found {len(slither_issues)} Slither issues and {len(mythril_issues)} Mythril issues."
        elif slither_success:
            analysis_status = f"⚠️ Slither completed ({len(slither_issues)} issues), but Mythril failed. Results incomplete."
        elif mythril_success:
            analysis_status = f"⚠️ Mythril completed ({len(mythril_issues)} issues), but Slither failed. Results incomplete."
        else:
            analysis_status = "❌ Both analysis tools failed. Manual review strongly recommended."
        
        print(f"🤖 LLM generating summary with status: {analysis_status}")
        
        # Generate summary
        result = chain.invoke({
            "code": code[:2000],  # Truncate long code
            "slither_data": json.dumps(slither_report, indent=2)[:1000],
            "mythril_data": json.dumps(mythril_report, indent=2)[:1000],
            "analysis_status": analysis_status
        })
        
        summary = result.get("text", "").strip()
        
        # Ensure we have a summary
        if not summary or len(summary) < 10:
            summary = f"Analysis completed. {analysis_status}"
        
        print(f"✅ LLM summary generated ({len(summary)} chars)")
        return summary
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ LLM error: {str(e)}")
        return f"LLM analysis failed: {str(e)}. Analysis status: Slither and Mythril may have encountered issues."