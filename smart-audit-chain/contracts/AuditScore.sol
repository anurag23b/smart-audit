// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditScore {
    struct Audit {
        address auditor;
        string contractHash;
        string grade;
        string summary;
        uint256 timestamp;
    }

    mapping(uint => Audit) public audits;
    uint public auditCount;

    function recordAudit(string memory contractHash, string memory grade, string memory summary) public {
        audits[auditCount++] = Audit(msg.sender, contractHash, grade, summary, block.timestamp);
    }

    function getAudit(uint id) public view returns (Audit memory) {
        return audits[id];
    }
}
