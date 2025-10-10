// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "src/FlutterAttester.sol";

contract Toast is Script {
    ISchemaRegistry private constant schemaRegistry = ISchemaRegistry(0x4200000000000000000000000000000000000021);

    address owner;
    uint256 ownerPK;

    function setUp() public {
        ownerPK = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        owner = vm.addr(ownerPK);
    }

    function run() public {
        vm.startBroadcast(ownerPK);

        FlutterAttester attester = new FlutterAttester();

        bytes32 schemaUID = attester.registerSchema('bytes32 answer, uint256 timestamp, uint256 score', ISchemaResolver(address(0)), true);

        vm.stopBroadcast();
    }
}
