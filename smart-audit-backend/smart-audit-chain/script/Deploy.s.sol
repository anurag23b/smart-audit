// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "forge-std/Script.sol";
import "../contracts/AuditScore.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        AuditScore auditScore = new AuditScore();
        console.log("AuditScore deployed at:", address(auditScore));
        vm.stopBroadcast();
    }
}