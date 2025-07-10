// test/AuditScore.t.sol
// forge test

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
        ( , string memory hash, string memory grade, string memory summary, ) = audit.getAudit(0);
        assertEq(hash, "hash123");
        assertEq(grade, "B");
        assertEq(summary, "Audit passed");
    }
}
