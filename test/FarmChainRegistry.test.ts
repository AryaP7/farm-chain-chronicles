import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("FarmChain Traceability Core", function () {
  let registry: any;
  let produceBatch: any;
  let owner: any;
  let farmer: any;
  let logistics: any;
  let aggregator: any;
  let retailer: any;
  let unverifiedUser: any;

  before(async function () {
    [owner, farmer, logistics, aggregator, retailer, unverifiedUser] = await ethers.getSigners();
  });

  describe("FarmChainRegistry", function () {
    it("Should deploy and assign admin role", async function () {
      const FarmChainRegistry = await ethers.getContractFactory("FarmChainRegistry");
      registry = await FarmChainRegistry.deploy();
      await registry.waitForDeployment();
    });

    it("Should register a participant", async function () {
      const locationHash = ethers.encodeBytes32String("LocationA");
      await registry.registerParticipant(farmer.address, 0, locationHash); // Role.FARMER = 0

      const isRegistered = await registry.isRegistered(farmer.address);
      expect(isRegistered).to.be.true;

      const participant = await registry.participants(farmer.address);
      expect(participant.isVerified).to.be.false;
    });

    it("Should verify a participant", async function () {
      let isVerified = await registry.isVerifiedParticipant(farmer.address);
      expect(isVerified).to.be.false;

      await registry.verifyParticipant(farmer.address);

      isVerified = await registry.isVerifiedParticipant(farmer.address);
      expect(isVerified).to.be.true;
    });

    it("Should prevent non-admins from registering", async function () {
      const locationHash = ethers.encodeBytes32String("LocationB");
      await expect(
        registry.connect(farmer).registerParticipant(logistics.address, 1, locationHash)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });

    it("Should retrieve correct role", async function () {
      const role = await registry.getParticipantRole(farmer.address);
      expect(role).to.equal(0n); // FARMER
    });
  });

  describe("ProduceBatch Token & State Machine", function () {
    before(async function () {
      const ProduceBatch = await ethers.getContractFactory("ProduceBatch");
      produceBatch = await ProduceBatch.deploy(await registry.getAddress());
      await produceBatch.waitForDeployment();

      // Register existing roles
      await registry.registerParticipant(logistics.address, 1, ethers.encodeBytes32String("LocL"));
      await registry.verifyParticipant(logistics.address);

      await registry.registerParticipant(aggregator.address, 2, ethers.encodeBytes32String("LocA"));
      await registry.verifyParticipant(aggregator.address);

      await registry.registerParticipant(retailer.address, 3, ethers.encodeBytes32String("LocR"));
      await registry.verifyParticipant(retailer.address);
    });

    it("Should allow FARMER to mint a batch", async function () {
      await produceBatch.connect(farmer).mintBatch(5000, 100, "Apples");

      const ownerOfBatch = await produceBatch.ownerOf(1);
      expect(ownerOfBatch).to.equal(farmer.address);

      const batchState = await produceBatch.batchStates(1);
      expect(batchState).to.equal(0n); // HARVESTED
    });

    it("Should prevent unverified participant from minting", async function () {
      await expect(
         produceBatch.connect(unverifiedUser).mintBatch(5000, 100, "Apples")
      ).to.be.revertedWith("ProduceBatch: Only verified participants can mint");
    });

    it("Should initiate custody transfer (Step 1)", async function () {
      await produceBatch.connect(farmer).transferCustody(1, logistics.address);
      
      const pendingReceiver = await produceBatch.pendingReceivers(1);
      expect(pendingReceiver).to.equal(logistics.address);
    });

    it("Should accept custody and alter state (Step 2)", async function () {
      const arrivalHash = ethers.encodeBytes32String("ArrivalLogistics");
      await produceBatch.connect(logistics).acceptCustody(1, arrivalHash);

      const ownerOfBatch = await produceBatch.ownerOf(1);
      expect(ownerOfBatch).to.equal(logistics.address); // Logistics is new owner

      const batchState = await produceBatch.batchStates(1);
      expect(batchState).to.equal(1n); // IN_TRANSIT
    });

    it("Should block unauthorized custody acceptance", async function () {
      const arrivalHash = ethers.encodeBytes32String("BadActorHash");
      await expect(
        produceBatch.connect(unverifiedUser).acceptCustody(1, arrivalHash)
      ).to.be.revertedWith("ProduceBatch: You are not the pending receiver");
    });

    it("Should block standard transferFrom", async function () {
      await expect(
        produceBatch.connect(logistics).transferFrom(logistics.address, aggregator.address, 1)
      ).to.be.revertedWith("ProduceBatch: Standard transfers blocked. Use transferCustody and acceptCustody");
    });

    it("Should transfer to Retailer and mark as SOLD", async function () {
      // Logistics -> Retailer 
      await produceBatch.connect(logistics).transferCustody(1, retailer.address);
      await produceBatch.connect(retailer).acceptCustody(1, ethers.encodeBytes32String("ArrivalRetailer"));

      let batchState = await produceBatch.batchStates(1);
      expect(batchState).to.equal(3n); // RETAIL_ARRIVED

      // Sell
      await produceBatch.connect(retailer).markAsSold(1);
      batchState = await produceBatch.batchStates(1);
      expect(batchState).to.equal(4n); // SOLD
    });
  });
});