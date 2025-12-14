// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/AuditScore.sol";

contract AuditScoreTest is Test {
    AuditScore audit;

    function setUp() public {
        audit = new AuditScore();
    }

    function testRecordAudit() public {
        audit.recordAudit("hash123", "B", "Audit passed");
        AuditScore.Audit memory result = audit.getAudit(0);
        assertEq(result.contractHash, "hash123");
        assertEq(result.grade, "B");
        assertEq(result.summary, "Audit passed");
    }

    function testMultipleAuditGrades() public {
        audit.recordAudit("hashA", "A", "All checks passed.");
        audit.recordAudit("hashC", "C", "Some issues found.");
        audit.recordAudit("hashF", "F", "Critical vulnerabilities.");

        AuditScore.Audit memory a = audit.getAudit(0);
        AuditScore.Audit memory c = audit.getAudit(1);
        AuditScore.Audit memory f = audit.getAudit(2);

        assertEq(a.grade, "A");
        assertEq(c.grade, "C");
        assertEq(f.grade, "F");

        assertEq(a.contractHash, "hashA");
        assertEq(c.contractHash, "hashC");
        assertEq(f.contractHash, "hashF");
    }
}
