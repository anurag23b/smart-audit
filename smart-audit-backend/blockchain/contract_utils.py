from web3 import Web3
import json
import os

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

# Compute correct artifact path
current_file = os.path.abspath(__file__)
backend_dir = os.path.dirname(current_file)
project_root = os.path.dirname(os.path.dirname(backend_dir))
artifact_path = os.path.join(project_root, "smart-audit-chain", "out", "AuditScore.sol", "AuditScore.json")

# Load contract ABI
with open(artifact_path) as f:
    data = json.load(f)
    abi = data["abi"]
    bytecode = data["bytecode"]

# ✅ Convert to checksum address
contract_address = Web3.to_checksum_address("0x5b73c5498c1e3b4dba84de0f1833c4a029d90519")
contract = w3.eth.contract(address=contract_address, abi=abi)
account = w3.eth.accounts[0]

def record_audit(contract_hash, grade, summary):
    tx = contract.functions.recordAudit(contract_hash, grade, summary).transact({"from": account})
    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt.transactionHash.hex()
