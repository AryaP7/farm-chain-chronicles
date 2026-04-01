import json
import argparse
from scoring_engine import calculate_grade

def run_demo_suite():
    """Runs a suite of predefined scenarios to test all inputs and outputs."""
    scenarios = [
        {
            "name": "TEST 1: Perfect Cold Chain (EXPECT ACCEPT)",
            "inputs": {"produce_type": "Strawberry", "w_origin": 1000.0, "w_current": 995.0, "current_temp": 4.0, "transit_hours": 12.0}
        },
        {
            "name": "TEST 2: Heat Damage Spoilage (EXPECT DISPUTE)",
            "inputs": {"produce_type": "Apple", "w_origin": 1000.0, "w_current": 890.0, "current_temp": 35.0, "transit_hours": 24.0}
        },
        {
            "name": "TEST 3: Dynamic Anomaly (Chemical Waxing/Water Soaking) (EXPECT DISPUTE)",
            "inputs": {"produce_type": "Apple", "w_origin": 1000.0, "w_current": 999.0, "current_temp": 30.0, "transit_hours": 60.0}
        },
        {
            "name": "TEST 4: 100% Base Anomaly (EXPECT DISPUTE)",
            "inputs": {"produce_type": "Strawberry", "w_origin": 1000.0, "w_current": 1000.0, "current_temp": 15.0, "transit_hours": 50.0}
        },
        {
            "name": "TEST 5: Fallback Unknown Produce (EXPECT ACCEPT)",
            "inputs": {"produce_type": "Banana", "w_origin": 1000.0, "w_current": 910.0, "current_temp": 25.0, "transit_hours": 24.0}
        }
    ]

    print("=========================================================")
    print("   FARM-CHAIN CHRONICLES - SCORING ENGINE INTEGRATION    ")
    print("=========================================================\n")

    for i, scenario in enumerate(scenarios, 1):
        print(f"--- {scenario['name']} ---")
        print("[Input Data]")
        print(json.dumps(scenario['inputs'], indent=2))
        
        try:
            result = calculate_grade(**scenario['inputs'])
            print("[Output Data]")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"[Error]: {e}")
        print("\n" + "-"*50 + "\n")

def main():
    parser = argparse.ArgumentParser(description="State-of-the-Art Scoring Engine - Freshness Rate Calculator")
    
    parser.add_argument('--produce', type=str, default=None, help='Type of produce (e.g. "Apple", "Strawberry")')
    parser.add_argument('--origin_w', type=float, default=1000.0, help='Weight from the farm (grams)')
    parser.add_argument('--current_w', type=float, default=980.0, help='Current weight at handover (grams)')
    parser.add_argument('--temp', type=float, default=22.5, help='Average temperature during transit leg (°C)')
    parser.add_argument('--hours', type=float, default=36.0, help='Time spent in this transit leg (hours)')
    parser.add_argument('--run-all', action='store_true', help='Run all predefined test scenarios')

    args = parser.parse_args()

    # If --run-all is passed or no specific produce is targeted, run the integration suite
    if args.run_all or not args.produce:
        run_demo_suite()
    else:
        print(f"\n--- Scoring Engine IO Aggregator ---")
        print(f"[Input Log]")
        print(f"  Produce:         {args.produce}")
        print(f"  Origin Weight:   {args.origin_w}g")
        print(f"  Current Weight:  {args.current_w}g")
        print(f"  Temperature:     {args.temp}°C")
        print(f"  Transit Time:    {args.hours} Hrs")

        try:
            engine_result = calculate_grade(
                produce_type=args.produce,
                w_origin=args.origin_w,
                w_current=args.current_w,
                current_temp=args.temp,
                transit_hours=args.hours
            )

            print("\n[Output Signal] (Propagates to Module 1 & Module 4)")
            print(json.dumps(engine_result, indent=4, sort_keys=False))

        except Exception as e:
            print(f"\n[Error]: {e}")

if __name__ == "__main__":
    main()
