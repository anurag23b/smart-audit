// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Test Token";
    string public symbol = "MTT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    mapping(address => uint256) balances;

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply;
        balances[msg.sender] = totalSupply;
    }

    // ❌ Does not use SafeMath — overflows possible in older versions
    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        return true;
    }

    // ❌ Unsafe withdraw — potential reentrancy, sends all funds
    function withdraw() public {
        require(msg.sender == owner, "Not authorized");
        payable(msg.sender).transfer(address(this).balance);
    }

    // ❌ No receive or fallback — ETH can get locked
    function donate() public payable {}
}
