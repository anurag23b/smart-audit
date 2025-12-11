import subprocess
import json
import os

def run_slither_local(file_path: str) -> dict:
    """
    Run Slither analysis on a Solidity contract.
    Prefers native solc (amd64); falls back to solcjs wrapper.
    """
    try:
        # Try to use solc wrapper explicitly
        solc_path = "/root/.solcx/solc-v0.8.20"
        # If native solc exists, use that path instead (more reliable than solcjs)
        if os.path.exists("/usr/bin/solc"):
            solc_path = "/usr/bin/solc"
        
        # Run Slither with explicit solc path
        cmd = [
            "slither",
            file_path,
            "--json", "-",
            "--solc", solc_path,
            "--solc-disable-warnings",
            "--skip-assembly",
            "--solc-args", "--allow-paths /app,/app/uploads"
        ]
        
        print(f"🔍 Running Slither: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        print(f"📊 Slither exit code: {result.returncode}")
        print(f"📤 Slither stdout length: {len(result.stdout)}")
        if result.stderr:
            print(f"📤 Slither stderr (full): {result.stderr}")
        else:
            print(f"📤 Slither stderr: None")
        
        # Try to parse JSON output first
        if result.stdout.strip():
            try:
                output = json.loads(result.stdout)
                
                # Extract detectors/results
                detectors = output.get("results", {}).get("detectors", [])
                
                # Convert to issues format
                issues = []
                for detector in detectors:
                    issues.append({
                        "severity": detector.get("impact", "Low"),
                        "title": detector.get("check", "Unknown"),
                        "description": detector.get("description", "No description"),
                        "confidence": detector.get("confidence", "Unknown")
                    })
                
                print(f"✅ Slither parsed successfully: {len(issues)} issues found")
                return {
                    "success": True,
                    "issues": issues,
                    "error": None
                }
            except json.JSONDecodeError as e:
                print(f"❌ JSON parse error: {str(e)}")
                print(f"❌ Raw stdout (first 500): {result.stdout[:500]}")
        
        # Check stderr for compilation errors
        if result.stderr:
            stderr_lower = result.stderr.lower()
            
            # Look for specific error patterns
            if "error" in stderr_lower and ("compilation" in stderr_lower or "solc" in stderr_lower):
                return {
                    "success": False,
                    "error": f"Slither compilation error: {result.stderr[:500]}",
                    "issues": []
                }
        
        # Exit code 1 with no output = failure
        if result.returncode != 0 and not result.stdout.strip():
            error_msg = result.stderr if result.stderr else "Slither failed with no output (possible solc compatibility issue)"
            return {
                "success": False,
                "error": error_msg[:500],
                "issues": []
            }
        
        # Empty output might mean no issues
        return {
            "success": True,
            "issues": [],
            "error": None
        }
    
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Slither analysis timed out (>2 minutes)",
            "issues": []
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "issues": []
        }