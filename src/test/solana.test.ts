import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @solana/web3.js Connection so confirmTransaction doesn't hit the network
vi.mock("@solana/web3.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@solana/web3.js")>();
  return {
    ...actual,
    Connection: vi.fn().mockImplementation(() => ({
      confirmTransaction: vi.fn().mockResolvedValue({ value: {} }),
    })),
  };
});

import {
  getExplorerUrl,
  registerFarmer,
  registerRetailer,
  trackProduce,
} from "@/lib/solana";
import { PublicKey } from "@solana/web3.js";

const FAKE_SIG = "5fakeSignatureABCDEFGH1234567890";
const FAKE_PUBKEY = new PublicKey("11111111111111111111111111111111");

const mockSendTransaction = vi.fn().mockResolvedValue(FAKE_SIG);

beforeEach(() => {
  mockSendTransaction.mockClear();
});

describe("getExplorerUrl", () => {
  it("returns a devnet explorer URL containing the signature", () => {
    const url = getExplorerUrl(FAKE_SIG);
    expect(url).toContain(FAKE_SIG);
    expect(url).toContain("explorer.solana.com");
    expect(url).toContain("devnet");
  });

  it("returns a full HTTPS URL", () => {
    const url = getExplorerUrl(FAKE_SIG);
    expect(url).toMatch(/^https:\/\//);
  });

  it("includes /tx/ path segment", () => {
    const url = getExplorerUrl(FAKE_SIG);
    expect(url).toContain("/tx/");
  });
});

describe("registerFarmer", () => {
  it("calls sendTransaction and returns the signature", async () => {
    const sig = await registerFarmer(FAKE_PUBKEY, mockSendTransaction, "Test Farm");
    expect(sig).toBe(FAKE_SIG);
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
  });

  it("passes a Transaction object to sendTransaction", async () => {
    await registerFarmer(FAKE_PUBKEY, mockSendTransaction, "Test Farm");
    const [tx] = mockSendTransaction.mock.calls[0];
    expect(tx).toBeDefined();
    expect(typeof tx).toBe("object");
  });
});

describe("registerRetailer", () => {
  it("calls sendTransaction and returns the signature", async () => {
    const sig = await registerRetailer(FAKE_PUBKEY, mockSendTransaction, "Test Retailer");
    expect(sig).toBe(FAKE_SIG);
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
  });

  it("passes a Transaction object to sendTransaction", async () => {
    await registerRetailer(FAKE_PUBKEY, mockSendTransaction, "Test Retailer");
    const [tx] = mockSendTransaction.mock.calls[0];
    expect(tx).toBeDefined();
  });
});

describe("trackProduce", () => {
  it("calls sendTransaction and returns the signature", async () => {
    const sig = await trackProduce(FAKE_PUBKEY, mockSendTransaction, {
      crop: "Tomatoes",
      weight: 100,
      location: "Farm A",
    });
    expect(sig).toBe(FAKE_SIG);
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
  });

  it("passes a Transaction object to sendTransaction", async () => {
    await trackProduce(FAKE_PUBKEY, mockSendTransaction, {
      crop: "Carrots",
      weight: 50,
      location: "Farm B",
    });
    const [tx] = mockSendTransaction.mock.calls[0];
    expect(tx).toBeDefined();
  });

  it("propagates errors from sendTransaction", async () => {
    mockSendTransaction.mockRejectedValueOnce(new Error("User rejected"));
    await expect(
      trackProduce(FAKE_PUBKEY, mockSendTransaction, {
        crop: "Corn",
        weight: 200,
        location: "Farm C",
      })
    ).rejects.toThrow("User rejected");
  });
});
