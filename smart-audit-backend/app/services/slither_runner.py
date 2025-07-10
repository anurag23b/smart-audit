# smart-audit-backend/app/services/slither_runner.py

import subprocess
import os

def run_slither_docker(file_path: str) -> str:
    try:
        abs_path = os.path.abspath(file_path)
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{abs_path}:/contract.sol",
                "trailofbits/slither",
                "/contract.sol"
            ],
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return f"Slither error: {str(e)}"
