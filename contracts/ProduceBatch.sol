// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./FarmChainRegistry.sol"; // Using the Registry module

contract ProduceBatch is ERC721 {
    FarmChainRegistry public registry;

    enum BatchState { HARVESTED, IN_TRANSIT, AGGREGATED, RETAIL_ARRIVED, SOLD }

    struct Batch {
        uint256 batchId;
        address currentOwner;
        uint256 wOrigin; // Original weight in grams
        uint256 nItems;  // Count of items
        string produceType;
        uint256 harvestDate;
        bytes32[] transitHistory; // Array of IPFS hashes for each hop
    }

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => BatchState) public batchStates;
    mapping(uint256 => address) public pendingReceivers; // batchId -> pending receiver address

    uint256 private _currentBatchId;

    event BatchMinted(uint256 indexed batchId, address indexed initialOwner);
    event CustodyTransferInitiated(uint256 indexed batchId, address indexed sender, address indexed receiver);
    event CustodyAccepted(uint256 indexed batchId, address indexed newOwner, uint256 timestamp);

    constructor(address _registryAddress) ERC721("ProduceBatch", "PBT") {
        require(_registryAddress != address(0), "ProduceBatch: Invalid registry address");
        registry = FarmChainRegistry(_registryAddress);
    }

    // Custom logic to block standard transfers that bypass the dual signature flow
    function transferFrom(address, address, uint256) public virtual override {
        revert("ProduceBatch: Standard transfers blocked. Use transferCustody and acceptCustody");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public virtual override {
        revert("ProduceBatch: Standard safeTransfers blocked. Use transferCustody and acceptCustody");
    }

    // Only Verified FARMER can mint a batch initially
    function mintBatch(uint256 _wOrigin, uint256 _nItems, string memory _produceType) public {
        require(registry.isVerifiedParticipant(msg.sender), "ProduceBatch: Only verified participants can mint");
        require(registry.getParticipantRole(msg.sender) == FarmChainRegistry.Role.FARMER, "ProduceBatch: Only FARMERs can mint");

        uint256 newBatchId = ++_currentBatchId;

        // Create empty array natively to bypass array literal error
        bytes32[] memory initialHistory = new bytes32[](0);

        batches[newBatchId] = Batch({
            batchId: newBatchId,
            currentOwner: msg.sender,
            wOrigin: _wOrigin,
            nItems: _nItems,
            produceType: _produceType,
            harvestDate: block.timestamp,
            transitHistory: initialHistory
        });

        batchStates[newBatchId] = BatchState.HARVESTED;

        _safeMint(msg.sender, newBatchId);
        emit BatchMinted(newBatchId, msg.sender);
    }

    // STEP 1: Current Custodian initiates handover
    function transferCustody(uint256 batchId, address receiverAddress) public {
        require(ownerOf(batchId) == msg.sender, "ProduceBatch: Not the token owner");
        require(registry.isVerifiedParticipant(receiverAddress), "ProduceBatch: Receiver is not a verified participant");
        require(batchStates[batchId] != BatchState.SOLD, "ProduceBatch: Batch already sold");

        pendingReceivers[batchId] = receiverAddress;

        emit CustodyTransferInitiated(batchId, msg.sender, receiverAddress);
    }

    // STEP 2: Receiver confirms arrival and assumes custody
    function acceptCustody(uint256 batchId, bytes32 arrivalFRS) public {
        require(pendingReceivers[batchId] == msg.sender, "ProduceBatch: You are not the pending receiver");

        // Clear pending status
        delete pendingReceivers[batchId];

        // Retrieve receiver role
        FarmChainRegistry.Role receiverRole = registry.getParticipantRole(msg.sender);

        // Advance state based on the new owner's role
        if (receiverRole == FarmChainRegistry.Role.LOGISTICS) {
            batchStates[batchId] = BatchState.IN_TRANSIT;
        } else if (receiverRole == FarmChainRegistry.Role.AGGREGATOR) {
            batchStates[batchId] = BatchState.AGGREGATED;
        } else if (receiverRole == FarmChainRegistry.Role.RETAILER) {
            batchStates[batchId] = BatchState.RETAIL_ARRIVED;
        } // Farmers receive it back or otherwise, state could remain or change depending on business logic

        // Modify local Batch structure
        batches[batchId].currentOwner = msg.sender;
        batches[batchId].transitHistory.push(arrivalFRS); // Assuming IPFS hash of arrival scan details is exactly 32 bytes

        address previousOwner = ownerOf(batchId);

        // Perform standard internal _transfer to physically reassign token
        _transfer(previousOwner, msg.sender, batchId);

        emit CustodyAccepted(batchId, msg.sender, block.timestamp);
    }

    // A retailer can mark item as sold to an end consumer
    function markAsSold(uint256 batchId) public {
        require(ownerOf(batchId) == msg.sender, "ProduceBatch: Not the owner");
        require(registry.getParticipantRole(msg.sender) == FarmChainRegistry.Role.RETAILER, "ProduceBatch: Only retailers can sell");

        batchStates[batchId] = BatchState.SOLD;
    }
}