from app.services.slither_runner import run_slither_local
from app.services.mythril_runner import run_mythril_local
import platform
import os


def _arm_guard():
    """
    Slither/Mythril binaries are unstable on ARM (mac M1/M2) unless running with
    x86_64 emulation. Skip by default on ARM, unless explicitly overridden.
    """
    if os.environ.get("FORCE_ANALYSIS_ON_ARM", "").lower() in {"1", "true"}:
        return None
    arch = platform.machine().lower()
    if "arm" in arch or "aarch" in arch:
        msg = (
            "Static analysis skipped on ARM (M1/M2). "
            "Use DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up --build "
            "or a Linux/x86_64 host for full Slither/Mythril results. "
            "To force run on ARM (may fail), set FORCE_ANALYSIS_ON_ARM=true."
        )
        return {
            "slither": {"success": False, "error": msg, "issues": []},
            "mythril": {"success": False, "error": msg, "issues": []},
        }
    return None

def run_static_analysis(file_path):
    """
    Run both Slither and Mythril analysis.
    Returns reports with success flags.
    """
    arm_block = _arm_guard()
    if arm_block:
        return arm_block

    slither_report = run_slither_local(file_path)
    mythril_report = run_mythril_local(file_path)
    
    slither_success = slither_report.get("success", False)
    mythril_success = mythril_report.get("success", False)
    
    print(f"📊 Slither success: {slither_success}")
    print(f"📊 Mythril success: {mythril_success}")
    
    # Log errors if present
    if not slither_success:
        print(f"❌ Slither error: {slither_report.get('error', 'Unknown error')}")
    if not mythril_success:
        print(f"❌ Mythril error: {mythril_report.get('error', 'Unknown error')}")
    
    return {
        "slither": slither_report,
        "mythril": mythril_report
    }

def compute_security_grade(slither_report, mythril_report, llm_summary):
    """
    Compute security grade based on analysis results.
    Returns lower grade if analysis tools failed.
    """
    
    # Check if analysis tools succeeded
    slither_success = slither_report.get("success", False)
    mythril_success = mythril_report.get("success", False)
    
    # If BOTH tools failed, surface that clearly
    if not slither_success and not mythril_success:
        return "N/A (tools failed)", 0.0
    
    # If one tool failed, cap grade at C
    if not slither_success or not mythril_success:
        max_grade = "C"
        max_cvss = 6.0
    else:
        max_grade = "A+"
        max_cvss = 10.0
    
    # Extract issues from reports
    slither_issues = slither_report.get("issues", [])
    mythril_issues = mythril_report.get("issues", [])
    
    # If no issues found in both tools (and both succeeded)
    if len(slither_issues) == 0 and len(mythril_issues) == 0 and slither_success and mythril_success:
        return "A+", 9.5
    
    total_issues = len(slither_issues) + len(mythril_issues)
    severity_score = 0
    
    # Calculate severity score
    for issue in slither_issues + mythril_issues:
        severity = issue.get("severity", issue.get("impact", "Low"))
        severity_map = {
            "Critical": 4,
            "High": 3,
            "Medium": 2,
            "Low": 1,
            "Informational": 0.5
        }
        severity_score += severity_map.get(severity, 1)
    
    # Calculate CVSS score (0-10 scale)
    if total_issues == 0:
        cvss_score = 9.5
    else:
        # Average severity * penalty factor
        avg_severity = severity_score / total_issues
        cvss_score = max(0.0, 10.0 - (avg_severity * total_issues * 0.5))
    
    # Cap CVSS if tools failed
    cvss_score = min(cvss_score, max_cvss)
    
    # Assign grade
    if cvss_score >= 9.0:
        grade = "A+"
    elif cvss_score >= 8.0:
        grade = "A"
    elif cvss_score >= 7.0:
        grade = "B+"
    elif cvss_score >= 6.0:
        grade = "B"
    elif cvss_score >= 5.0:
        grade = "C"
    elif cvss_score >= 4.0:
        grade = "D"
    else:
        grade = "F"
    
    # Apply grade cap if tools failed
    grade_order = ["F", "D", "C", "B", "B+", "A", "A+"]
    if grade_order.index(grade) > grade_order.index(max_grade):
        grade = max_grade
    
    return grade, round(cvss_score, 2)