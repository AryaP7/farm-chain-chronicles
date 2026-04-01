import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import JourneySection from "@/components/JourneySection";

vi.mock("@/assets/journey-map.jpg", () => ({ default: "journey-map.jpg" }));

const EXPECTED_STAGES = ["Farm", "Transport", "Aggregator", "Market", "Retail Store", "Consumer"];

describe("JourneySection", () => {
  it("renders 'The Journey' heading", () => {
    render(<JourneySection />);
    expect(screen.getByText("The Journey")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<JourneySection />);
    expect(
      screen.getByText(/Follow the path of your food/i)
    ).toBeInTheDocument();
  });

  it("renders all 6 supply chain stage markers", () => {
    render(<JourneySection />);
    for (const stage of EXPECTED_STAGES) {
      // Stage names appear in hover cards — query within the DOM
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });

  it("renders journey map image", () => {
    render(<JourneySection />);
    const img = screen.getByAltText(/Supply chain journey map/i);
    expect(img).toBeInTheDocument();
  });

  it("renders stage descriptions", () => {
    render(<JourneySection />);
    expect(
      screen.getByText(/Consumers scan the QR code/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Crops are harvested/i)
    ).toBeInTheDocument();
  });
});
