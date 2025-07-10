# smart-audit-backend/app/services/static_analysis.py

from app.services.mythril_runner import run_mythril_docker
from app.services.slither_runner import run_slither_docker

def run_static_analysis(file_path: str) -> dict:
    mythril_result = run_mythril_docker(file_path)
    slither_result = run_slither_docker(file_path)
    return {
        "mythril": mythril_result,
        "slither": slither_result
    }
