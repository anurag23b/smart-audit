// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditScore {
    struct Audit {
        address auditor;
        string contractHash;
        string grade;
        string summary;
        string cid; // Added for NFT.Storage metadata
        uint256 timestamp;
    }

    mapping(string => Audit) public audits;
    event AuditRecorded(string contractHash, string grade, string summary, string cid, uint256 timestamp);

    function recordAudit(string memory contractHash, string memory grade, string memory summary, string memory cid) public {
        audits[contractHash] = Audit(msg.sender, contractHash, grade, summary, cid, block.timestamp);
        emit AuditRecorded(contractHash, grade, summary, cid, block.timestamp);
    }

    function getAuditByHash(string memory contractHash) public view returns (bool, Audit memory) {
        Audit memory audit = audits[contractHash];
        if (audit.auditor == address(0)) {
            return (false, Audit(address(0), "", "", "", "", 0));
        }
        return (true, audit);
    }
}