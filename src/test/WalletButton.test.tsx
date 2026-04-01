import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WalletButton from "@/components/WalletButton";

const mockDisconnect = vi.fn();
const mockSetVisible = vi.fn();

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: vi.fn(),
}));

vi.mock("@solana/wallet-adapter-react-ui", () => ({
  useWalletModal: () => ({ setVisible: mockSetVisible }),
}));

import { useWallet } from "@solana/wallet-adapter-react";

describe("WalletButton", () => {
  it("shows 'Connect Wallet' when not connected", () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: null,
      connected: false,
      disconnect: mockDisconnect,
    } as any);

    render(<WalletButton />);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("opens wallet modal on click when not connected", () => {
    vi.mocked(useWallet).mockReturnValue({
      publicKey: null,
      connected: false,
      disconnect: mockDisconnect,
    } as any);

    render(<WalletButton />);
    fireEvent.click(screen.getByText("Connect Wallet"));
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });

  it("shows shortened address and Disconnect button when connected", () => {
    const { PublicKey } = vi.importActual<typeof import("@solana/web3.js")>(
      "@solana/web3.js"
    ) as any;
    // Use a well-known public key string
    const pubkey = {
      toBase58: () => "4Nd1mBQtrMJVYVfKf2PX98AWL2UeA2KWQAhMbKLSP9sq",
    };
    vi.mocked(useWallet).mockReturnValue({
      publicKey: pubkey as any,
      connected: true,
      disconnect: mockDisconnect,
    } as any);

    render(<WalletButton />);
    expect(screen.getByText("Disconnect")).toBeInTheDocument();
    // Should show abbreviated address: first 4 chars + last 4 chars
    expect(screen.getByText(/4Nd1\.\.\.P9sq/)).toBeInTheDocument();
  });

  it("calls disconnect when Disconnect button is clicked", () => {
    const pubkey = {
      toBase58: () => "4Nd1mBQtrMJVYVfKf2PX98AWL2UeA2KWQAhMbKLSP9sq",
    };
    vi.mocked(useWallet).mockReturnValue({
      publicKey: pubkey as any,
      connected: true,
      disconnect: mockDisconnect,
    } as any);

    render(<WalletButton />);
    fireEvent.click(screen.getByText("Disconnect"));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
