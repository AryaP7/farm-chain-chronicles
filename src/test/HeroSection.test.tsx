import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/HeroSection";

// Mock the hero image asset
vi.mock("@/assets/hero-landscape.jpg", () => ({ default: "hero-landscape.jpg" }));

describe("HeroSection", () => {
  it("renders the FarmChain heading", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("FarmChain");
  });

  it("renders the tagline", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/Tracking food from soil to store/i)
    ).toBeInTheDocument();
  });

  it("renders the 'Explore the Supply Chain' CTA link", () => {
    render(<HeroSection />);
    const link = screen.getByRole("link", { name: /Explore the Supply Chain/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#journey");
  });

  it("renders the hero landscape image with alt text", () => {
    render(<HeroSection />);
    const img = screen.getByAltText(/FarmChain illustrated countryside landscape/i);
    expect(img).toBeInTheDocument();
  });

  it("renders 'Scroll to begin' indicator", () => {
    render(<HeroSection />);
    expect(screen.getByText("Scroll to begin")).toBeInTheDocument();
  });
});
