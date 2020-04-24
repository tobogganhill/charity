pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./StringUtils.sol";


contract ProjectCatalog is Ownable {
    using StringUtils for string;

    mapping(bytes32 => address) public projects;

    