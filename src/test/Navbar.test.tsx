import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Navbar from "@/components/Navbar";

vi.mock("@solana/wallet-adapter-react", () => ({
  useWallet: () => ({ publicKey: null, connected: false, disconnect: vi.fn() }),
}));
vi.mock("@solana/wallet-adapter-react-ui", () => ({
  useWalletModal: () => ({ setVisible: vi.fn() }),
}));

describe("Navbar", () => {
  it("does not render nav when page is at top (scrollY = 0)", () => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    render(<Navbar />);
    // nav element should not be in the document
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders nav with FarmChain brand after scrolling past 300px", async () => {
    Object.defineProperty(window, "scrollY", { value: 400, writable: true, configurable: true });
    render(<Navbar />);

    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(screen.getByText("FarmChain")).toBeInTheDocument();
  });

  it("renders all navigation links when visible", async () => {
    Object.defineProperty(window, "scrollY", { value: 400, writable: true, configurable: true });
    render(<Navbar />);

    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    const expectedLinks = ["Journey", "How It Works", "Freshness", "Fund", "Join"];
    for (const label of expectedLinks) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
