from web3 import Web3
import json
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
WEB3_PROVIDER = os.getenv("WEB3_PROVIDER", "http://host.docker.internal:8545")
PINATA_JWT = os.getenv("PINATA_JWT")
PINATA_GATEWAY = os.getenv("PINATA_GATEWAY")
NFT_STORAGE_TOKEN = os.getenv("NFT_STORAGE_TOKEN")

w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

if PRIVATE_KEY:
    account = w3.eth.account.from_key(PRIVATE_KEY)
else:
    accounts = w3.eth.accounts
    account = accounts[0] if accounts else None
    if account is None:
        raise RuntimeError("No Ethereum accounts available.")

# Load ABI
artifact_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../smart-audit-chain/out/AuditScore.sol/AuditScore.json")
)

with open(artifact_path, "r") as f:
    data = json.load(f)

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=data["abi"]
)

def upload_to_pinata(metadata):
    """Upload metadata JSON to Pinata IPFS"""
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"  # ✅ CORRECT URL
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}",
        "Content-Type": "application/json"
    }
    body = {
        "pinataOptions": {
            "cidVersion": 1
        },
        "pinataMetadata": {
            "name": "smart-audit-metadata",
            "keyvalues": {
                "contract_hash": metadata.get("contract_hash", ""),
                "security_grade": metadata.get("security_grade", ""),
                "timestamp": str(metadata.get("timestamp", ""))
            }
        },
        "pinataContent": metadata  # The actual JSON data to pin
    }

    print(f"📤 Uploading to Pinata: {url}")
    res = requests.post(url, headers=headers, json=body)
    
    print(f"📊 Pinata response status: {res.status_code}")
    
    if res.status_code not in (200, 202):
        print(f"❌ Pinata error response: {res.text}")
        raise Exception(f"Pinata Upload Failed: {res.text}")

    response_data = res.json()
    ipfs_hash = response_data.get("IpfsHash")
    print(f"✅ Successfully uploaded to IPFS: {ipfs_hash}")
    
    return ipfs_hash


def upload_to_nft_storage(metadata):
    """Upload metadata JSON to NFT.Storage; returns CID."""
    if not NFT_STORAGE_TOKEN:
        raise Exception("NFT_STORAGE_TOKEN is not set")
    url = "https://api.nft.storage/upload"
    headers = {
        "Authorization": f"Bearer {NFT_STORAGE_TOKEN}",
    }
    files = {
        "file": ("metadata.json", json.dumps(metadata), "application/json"),
    }
    print(f"📤 Uploading to NFT.Storage: {url}")
    res = requests.post(url, headers=headers, files=files)
    print(f"📊 NFT.Storage response status: {res.status_code}")
    if res.status_code != 200:
        print(f"❌ NFT.Storage error response: {res.text}")
        raise Exception(f"NFT.Storage Upload Failed: {res.text}")
    data = res.json()
    cid = data.get("value", {}).get("cid")
    if not cid:
        raise Exception("NFT.Storage did not return CID")
    print(f"✅ Successfully uploaded to NFT.Storage: {cid}")
    return cid


def record_audit(contract_hash, grade, summary):
    """Record audit on blockchain and IPFS (Pinata + NFT.Storage)"""
    try:
        # Prepare metadata
        metadata = {
            "contract_hash": contract_hash,
            "security_grade": grade,
            "summary": summary,
            "timestamp": int(time.time())
        }

        # Upload to IPFS via Pinata
        cid_pinata = upload_to_pinata(metadata)
        print(f"📌 Metadata stored on Pinata/IPFS: {cid_pinata}")

        # Upload to NFT.Storage
        try:
            cid_nft = upload_to_nft_storage(metadata)
        except Exception as e:
            print(f"⚠️ NFT.Storage upload failed: {e}")
            cid_nft = "NFT_STORAGE_FAILED"

        # Record on blockchain
        tx = contract.functions.recordAudit(
            contract_hash,
            grade,
            summary,
            cid_pinata
        ).build_transaction({
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 300000,
            "gasPrice": w3.to_wei("5", "gwei"),
            "chainId": w3.eth.chain_id,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status != 1:
            raise Exception("Transaction failed on blockchain")

        print(f"⛓️  Blockchain transaction: {tx_hash.hex()}")
        return tx_hash.hex(), cid_pinata, cid_nft

    except Exception as e:
        print(f"🔥 Error in record_audit: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to record audit: {str(e)}")