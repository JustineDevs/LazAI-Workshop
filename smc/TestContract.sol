// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public message;
    
    constructor() {
        message = "Hello, World!";
    }
    
    function setMessage(string memory _message) public {
        message = _message;
    }
}
