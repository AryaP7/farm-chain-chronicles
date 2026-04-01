# Module 2: Scoring Engine (RS)

This module implements the stateless mathematical calculation engine for the **Freshness Rate Score (FRS)** based on weight loss. It evaluates transit legs across the supply chain, calculates temperature-adjusted estimated expiry (PDEE algorithm), grades produce freshness, and detects artificial preservation anomalies.

This engine feeds precisely into **Module 1 (Traceability)** for recording lifecycle history and **Module 4 (Dispute System)** to auto-trigger smart contract penalties.

## Key Features
1. **Freshness Rate Score (FRS)**: Evaluates loss of mass relative to original harvest weight.
2. **PDEE Algorithm (Q10 Biophysics)**:
   - `Expected_Loss_Rate` modeled via state-of-the-art $Q_{10}$ temperature coefficient kinetics (exponential growth instead of linear error models).
   - `Remaining_Life` mapped dynamically against rejection thresholds.
3. **Dynamic Anomaly Detection**: 
   - Base rule: Flag if `FRS == 100%` after `48 hours` transit.
   - Dynamic rule: Flag if produce exhibits *profoundly less* physiological water loss than the biophysical minimum over temperatures and durations, exposing spray-on artificial preservatives/hydration.
4. **Action Output**: Outputs `ACCEPT` or `DISPUTE` flags directly usable by Module 4 Dispute Contracts.

---

## Getting Started

### 1. Requirements
Ensure you have Python 3.10+ installed.

```bash
pip install -r requirements.txt
```

### 2. Running Tests
You can run the predefined test suite directly through `pytest`:

```bash
pytest test_scoring_engine.py -v
```

---
### Using Output Aggregator (`main.py`)
A fast CLI tool is provided to aggregate the specific IO tests locally for demonstrations.

```bash
python main.py --produce Strawberry --origin_w 1000 --current_w 998 --temp 30 --hours 40
```
*(Try this example: At 30°C over 40 hours, natural water loss dictates >0.3% loss via transpiration. With 99.8% FRS at handover, the engine intelligently flags an anti-tampering anomaly even though it's technically a Grade "A", halting escrow payments).*

---

## Integration / API Guide

### Main Function

```python
from scoring_engine import calculate_grade

result = calculate_grade(
    produce_type="Apple",
    w_origin=1000.0,       # Original weight from farm (grams)
    w_current=980.0,       # Current weight at handover point (grams)
    current_temp=22.5,     # Average transit temperature (°C)
    transit_hours=36.0     # Time spent in transit for an anomaly check
)
```

### I/O Data Format

**Input Parameters**
* `produce_type` (str): Specifies the Produce Tier (e.g., `"Apple"`, `"Strawberry"`). Dictates thresholds and decay constants.
* `w_origin` (float): Fixed harvest weight logged by Module 1.
* `w_current` (float): Measured weight at the current transfer station.
* `current_temp` (float): Avg. thermal signature evaluated over the transit leg.
* `transit_hours` (float): Leg duration. Used strictly for tampering detection.

**Output Structure (`dict`)**
```json
{
  "score": 98.0,            // float: Freshness percentage
  "grade": "A",             // str: Mapped against produce thresholds
  "action": "ACCEPT",       // str: Signals Module 4 -> "ACCEPT" or "DISPUTE"
  "remaining_life": 12.72,  // float: Hours of viable transport remaining (PDEE dynamic output)
  "anomaly_detected": false // bool: Did it trigger anti-tampering logic?
}
```

### Why Stateless?
The Scoring Engine manages zero internal state, does not process blockchain transactions, nor connects to a database. It allows highly scalable inference evaluating on-chain or off-chain data at speeds suitable for real-time APIs (or Chainlink orcles).

---

# Module 4: Automated Dispute & Reputation Ledger

This module operates entirely on-chain inside the Solana ecosystem (Rust/Anchor framework). It is triggered by off-chain evaluations (like the Python Engine in Module 2) to penalize bad actors and update a public trust score (MRQA).

## Core Mechanisms

### 1. The Dispute Contract (`FarmChainDispute`)
- Acts as a timed state machine.
- `trigger_dispute(batch_id, reason)`: Fired via Oracle when Module 2 yields a `"DISPUTE"` action. Initiates an escrow lock.
- `resolve_dispute()`: Resolves a dispute once the 48-hour evidence window closes. 

### 2. The Reputation Engine (`ReputationManager`)
Maintains a trust profile for each transporter. During `resolve_dispute()`, if an FRS drop over the leg is $>5\%$, a penalty is applied.
The formula calculates a smooth weighted moving average to insulate the score from extreme outliers:

$R_{new} = \frac{(R_{old} \times 80) + (Current\_Performance \times 20)}{100}$

### Anchor State Mappings
* **`Dispute`**: Holds metadata (`batch_id`, `transporter` pubkey, `dispute_start_time`, `escrow_amount`, `is_resolved`).
* **`ReputationProfile`**: Tracks long-term public trust, carrying the `score` and `total_trips`.

## Deployment Requirements
Ensure `solana-cli` and `anchor-cli` are installed for deploying to Devnet.
```bash
cd programs/farm_chain_dispute
anchor build
anchor deploy
```