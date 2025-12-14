import subprocess
import json
import os

def run_mythril_local(file_path: str) -> dict:
    """
    Run Mythril analysis on a Solidity contract.
    Compatible with solcjs wrapper (no --allow-paths flag).
    """
    try:
        # Ensure myth is available
        myth_path = "/usr/local/bin/myth"
        if not os.path.exists(myth_path):
            return {
                "success": False,
                "error": "Mythril not installed (myth not found at /usr/local/bin/myth)",
                "issues": []
            }
        
        # Set environment to PREVENT py-solc-x from downloading binaries
        env = os.environ.copy()
        env["SOLC_VERSION"] = "0.8.20"
        env["SOLCX_BINARY_PATH"] = "/root/.solcx"
        
        # CRITICAL: Tell Mythril to use specific solc (prevents download attempts)
        env["MYTHRIL_SOLC_PATH"] = "/root/.solcx/solc-v0.8.20"
        
        # Disable automatic installations
        env["SOLCX_INSTALL_BACKEND"] = "none"
        
        # Mythril command - IMPORTANT: Don't use --solv flag (triggers downloads)
        cmd = [
            myth_path,
            "analyze",
            file_path,
            "-o", "jsonv2",  # Use jsonv2 format for better output
            "--execution-timeout", "120"  # Reduced timeout
        ]
        
        print(f"🔍 Running Mythril: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=360,
            env=env
        )
        
        print(f"📊 Mythril exit code: {result.returncode}")
        print(f"📤 Mythril stdout: {result.stdout[:200]}")
        print(f"📤 Mythril stderr: {result.stderr[:200] if result.stderr else 'None'}")
        
        # Parse Mythril output
        if result.stdout.strip():
            try:
                output = json.loads(result.stdout)
                
                # Mythril jsonv2 format returns a LIST of report objects
                if isinstance(output, list):
                    if len(output) > 0:
                        report = output[0]  # Get first report
                        issues = report.get("issues", [])
                        
                        # Check for errors in meta logs
                        meta_logs = report.get("meta", {}).get("logs", [])
                        for log in meta_logs:
                            if log.get("level") == "error":
                                error_msg = log.get("msg", "Unknown error")
                                return {
                                    "success": False,
                                    "error": f"Mythril error: {error_msg[:500]}",
                                    "issues": []
                                }
                        
                        return {
                            "success": True,
                            "issues": issues,
                            "error": None
                        }
                    else:
                        # Empty list = no issues
                        return {
                            "success": True,
                            "issues": [],
                            "error": None
                        }
                
                # Old format (dict)
                elif isinstance(output, dict):
                    # Check if it's an error response
                    if "error" in output and output.get("success") == False:
                        return {
                            "success": False,
                            "error": output.get("error", "Unknown Mythril error")[:500],
                            "issues": []
                        }
                    
                    # Extract issues
                    issues = output.get("issues", [])
                    return {
                        "success": True,
                        "issues": issues,
                        "error": None
                    }
            except json.JSONDecodeError:
                # Not JSON, might be text output
                pass
        
        # Check stderr for specific errors
        if result.stderr:
            stderr_lower = result.stderr.lower()
            
            # Check for solc-related errors
            if "unknown option" in stderr_lower or "allow-paths" in stderr_lower:
                return {
                    "success": False,
                    "error": "Mythril/solcjs compatibility issue: solcjs doesn't support all solc flags",
                    "issues": [],
                    "hint": "This is a known limitation with solcjs on ARM64"
                }
            
            if "decode error" in stderr_lower:
                return {
                    "success": False,
                    "error": f"Mythril decode error: {result.stderr[:500]}",
                    "issues": []
                }
        
        # Check if it's a "no issues" case
        if result.returncode == 0 and not result.stdout.strip():
            return {
                "success": True,
                "issues": [],
                "error": None
            }
        
        # Error case
        error_msg = result.stderr if result.stderr else result.stdout
        return {
            "success": False,
            "error": f"Mythril failed: {error_msg[:500]}",
            "issues": []
        }
    
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Mythril analysis timed out (>5 minutes)",
            "issues": []
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Mythril error: {str(e)}",
            "issues": []
        }