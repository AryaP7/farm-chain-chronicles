import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CTASection from "@/components/CTASection";

const mockSetVisible = vi.fn();
const mockToast = vi.fn();
const mockSendTransaction = vi.fn().mockResolvedValue("fake-sig-123");

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn(),
}));
vi.mock("@solana/wallet-adapter-react-ui", () => ({
  useWalletModal: () => ({ setVisible: mockSetVisible }),
}));
vi.mock("@/lib/solana", () => ({
  registerFarmer: vi.fn().mockResolvedValue("fake-sig-farmer"),
  registerRetailer: vi.fn().mockResolvedValue("fake-sig-retailer"),
  trackProduce: vi.fn().mockResolvedValue("fake-sig-track"),
  getExplorerUrl: (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { useWallet } from "@solana/wallet-adapter-react";

const NOT_CONNECTED = {
  publicKey: null,
  connected: false,
  sendTransaction: mockSendTransaction,
} as any;

const CONNECTED = {
  publicKey: { toBase58: () => "4Nd1mBQtrMJVYVfKf2PX98AWL2UeA2KWQAhMbKLSP9sq" },
  connected: true,
  sendTransaction: mockSendTransaction,
} as any;

beforeEach(() => {
  vi.mocked(useWallet).mockReturnValue(NOT_CONNECTED);
  mockSetVisible.mockClear();
  mockToast.mockClear();
  mockSendTransaction.mockClear();
});

describe("CTASection", () => {
  it("renders the 'Join FarmChain' heading", () => {
    render(<CTASection />);
    expect(screen.getByText("Join FarmChain")).toBeInTheDocument();
  });

  it("renders all three action buttons", () => {
    render(<CTASection />);
    expect(screen.getByText("Register Farmer")).toBeInTheDocument();
    expect(screen.getByText("Become Retailer")).toBeInTheDocument();
    expect(screen.getByText("Track Produce")).toBeInTheDocument();
  });

  it("shows wallet prompt when not connected", () => {
    render(<CTASection />);
    expect(
      screen.getByText(/Connect your wallet to interact/i)
    ).toBeInTheDocument();
  });

  it("opens wallet modal when a button is clicked while not connected", () => {
    render(<CTASection />);
    fireEvent.click(screen.getByText("Register Farmer"));
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });

  it("shows connected address when wallet is connected", () => {
    vi.mocked(useWallet).mockReturnValue(CONNECTED);
    render(<CTASection />);
    expect(screen.getByText(/Connected:/)).toBeInTheDocument();
    expect(screen.getByText(/4Nd1/)).toBeInTheDocument();
  });

  it("calls registerFarmer and shows toast on success when connected", async () => {
    vi.mocked(useWallet).mockReturnValue(CONNECTED);
    const { registerFarmer } = await import("@/lib/solana");
    render(<CTASection />);

    fireEvent.click(screen.getByText("Register Farmer"));

    await waitFor(() => {
      expect(registerFarmer).toHaveBeenCalledWith(
        CONNECTED.publicKey,
        CONNECTED.sendTransaction,
        "Demo Farmer"
      );
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "✅ Transaction Confirmed!" })
      );
    });
  });

  it("shows error toast when transaction fails", async () => {
    vi.mocked(useWallet).mockReturnValue(CONNECTED);
    const { trackProduce } = await import("@/lib/solana");
    vi.mocked(trackProduce).mockRejectedValueOnce(new Error("Transaction failed"));
    render(<CTASection />);

    fireEvent.click(screen.getByText("Track Produce"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: "destructive" })
      );
    });
  });
});
