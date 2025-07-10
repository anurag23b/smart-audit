// script/Deploy.s.sol
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/AuditScore.sol";

contract DeployAudit is Script {
    function run() external {
        vm.startBroadcast();
        new AuditScore();
        vm.stopBroadcast();
    }
}
