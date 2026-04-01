import json
import argparse
from scoring_engine import calculate_grade

def main():
    parser = argparse.ArgumentParser(description="State-of-the-Art Scoring Engine - Freshness Rate Calculator")
    
    parser.add_argument('--produce', type=str, default='Apple', help='Type of produce (e.g. "Apple", "Strawberry")')
    parser.add_argument('--origin_w', type=float, default=1000.0, help='Weight from the farm (grams)')
    parser.add_argument('--current_w', type=float, default=980.0, help='Current weight at handover (grams)')
    parser.add_argument('--temp', type=float, default=22.5, help='Average temperature during transit leg (°C)')
    parser.add_argument('--hours', type=float, default=36.0, help='Time spent in this transit leg (hours)')

    args = parser.parse_args()

    print(f"\n--- Scoring Engine IO Aggregator ---")
    print(f"[Input Log]")
    print(f"  Produce:         {args.produce}")
    print(f"  Origin Weight:   {args.origin_w}g")
    print(f"  Current Weight:  {args.current_w}g")
    print(f"  Temperature:     {args.temp}°C")
    print(f"  Transit Time:    {args.hours} Hrs")

    # Run the Scoring Engine calculate function
    try:
        engine_result = calculate_grade(
            produce_type=args.produce,
            w_origin=args.origin_w,
            w_current=args.current_w,
            current_temp=args.temp,
            transit_hours=args.hours
        )

        print("\n[Output Signal] (Propagates to Module 1 & Module 4)")
        
        # Serialize dict to formatted JSON string
        print(json.dumps(engine_result, indent=4, sort_keys=False))

    except Exception as e:
        print(f"\n[Error]: {e}")

if __name__ == "__main__":
    main()
