import subprocess

def run_slither_analysis(contract_path: str) -> str:
    """
    Run Slither static analysis on the provided Solidity file.
    Returns the output as a string.
    """
    try:
        result = subprocess.run(
            ["slither", contract_path],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Slither analysis failed:\n{e.stderr}"


def run_mythril_analysis(contract_path: str) -> str:
    """
    Run Mythril symbolic analysis on the provided Solidity file.
    Returns the output as a string.
    """
    try:
        result = subprocess.run(
            ["myth", "analyze", contract_path],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Mythril analysis failed:\n{e.stderr}"
