// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Test Token";
    string public symbol = "MTT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) balances;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balances[msg.sender] = totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        return true;
    }
}
