// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import './interfaces/IEAS.sol';
import "./interfaces/ISchemaRegistry.sol";

contract FlutterAttester is EIP712 {
    using ECDSA for bytes32;

    ISchemaRegistry private constant schemaRegistry = ISchemaRegistry(0x4200000000000000000000000000000000000020);
    IEAS private constant _EAS = IEAS(0x4200000000000000000000000000000000000021);

    address owner;

    event AddressAttested(address indexed addr, bytes32 indexed id);
    event SchemaRegistered(bytes32 indexed id);

    error ZeroAddress();
    error InvalidSignature();

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() EIP712("Flutter", "0") {
        owner = msg.sender;
    }

    function registerSchema(string calldata schema, ISchemaResolver resolver, bool revocable) external onlyOwner returns (bytes32 schemaUID) {
        schemaUID = schemaRegistry.register(schema, resolver, revocable);
        emit SchemaRegistered(schemaUID);
    }

    function attestAddress(
        bytes32 schemaUID,
        address recipient,
        bytes calldata sig,
        bytes calldata data
    ) 
        external 
        onlyOwner 
        returns (bytes32)
    {
        if (recipient == address(0)) {
            revert ZeroAddress();
        }

        (bytes32 answer, uint256 timestamp, uint256 score) = abi.decode(data, (bytes32, uint256, uint256));

        if (recipient != verify(sig, answer, timestamp)) {
            revert InvalidSignature();
        }

        AttestationRequest memory request = AttestationRequest({
            schema: schemaUID,
            data: AttestationRequestData({
                recipient: recipient,
                expirationTime: uint64(block.timestamp + 24 hours),
                revocable: true,
                refUID: 0x0,
                data: data,
                value: 0
            })
        });

        bytes32 attestationUid = _EAS.attest(request);
        emit AddressAttested(recipient, attestationUid);

        return attestationUid;
    }

    function verify(bytes calldata sig, bytes32 answer, uint256 timestamp) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(
                keccak256("Questionnaire(string answer,uint256 timestamp)"),
                answer,
                timestamp
            ))
        );
        return digest.recover(sig);
    }
}