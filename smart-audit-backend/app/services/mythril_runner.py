# smart-audit-backend/app/services/mythril_runner.py

import subprocess
import os

def run_mythril_docker(file_path: str) -> str:
    try:
        abs_path = os.path.abspath(file_path)
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{abs_path}:/contract.sol",
                "mythril/myth",
                "-x", "/contract.sol"
            ],
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return f"Mythril error: {str(e)}"
