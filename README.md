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

## Integration & I/O Specifications (Module 2)

To integrate this Python Scoring Engine into your frontend backend (e.g., FastAPI, Node wrapper) or Chainlink external adapters, strictly follow these I/O formats.

### Input Format (Arguments passed to `calculate_grade`)

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `produce_type` | `str` | Yes | Defines the biological subset (configures Q10 decay constants & grading thresholds). | `"Apple"`, `"Strawberry"` |
| `w_origin` | `float` | Yes | The absolute harvest weight recorded at Module 1 origin (in grams). | `1000.0` |
| `w_current` | `float` | Yes | The weight checked at the current hand-over station (in grams). | `980.0` |
| `current_temp`| `float` | Yes | Average temperature across the transit leg (°C). | `22.5` |
| `transit_hours`| `float` | Yes | Time elapsed natively calculated during transport (in hours). Used for Anomaly Checks. | `36.0` |

### Output Format (Returns JSON-compatible `Dict`)

| Key | Type | Description |
| :--- | :--- | :--- |
| `score` | `float` | Real calculated Freshness Rate Score (bounded 0.0 - 100.0%). |
| `grade` | `str` | `"A"`, `"B"`, `"C"`, or `"F"` representing biological thresholds. |
| `action` | `str` | **Critical Flag**. Either `"ACCEPT"` or `"DISPUTE"`. Directly triggers Module 4 operations. |
| `remaining_life`| `float` | PDEE Estimated hours of transport viability remaining before rejection limits breach. |
| `anomaly_detected`| `bool` | `true` if artificial hydration/chemical tampering rules trigger an override. |

*Example Payload:*
```json
{
  "score": 98.0,
  "grade": "A",
  "action": "ACCEPT",
  "remaining_life": 12.72,
  "anomaly_detected": false
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

---

## Integration & I/O Specifications (Module 4)

To interact with the smart contracts on the Solana blockchain (or via your backend APIs like Anchor TS), pass the following instruction parameters:

### Instruction: `trigger_dispute`
Fires automatically entirely when Module 2 yields an `"action": "DISPUTE"`.

| Input Parameter | Rust Type | TS/Anchor Type | Description |
| :--- | :--- | :--- | :--- |
| `batch_id` | `u64` | `BN` / `number` | The supply chain token tracked. Matches Traceability state. |
| `reason` | `String` | `string` | The stringified reason ("Temperature Damage", "Base Anomaly", etc.). |

*Accounts Required:*
* `dispute` (Account `[Writable]`, *Program Derived Address* using `batch_id`)
* `authority` (Signer)
* `transporter` (`AccountInfo`, *The accused transport owner PubKey*)

### Instruction: `resolve_dispute`
Resolves the active escrow dispute ONLY once the exact blockchain Unix timestamp clears a 48-hour hurdle.

| Input Parameter | Rust Type | TS/Anchor Type | Description |
| :--- | :--- | :--- | :--- |
| `frs_drop` | `u64` | `BN` / `number` | FRS measurement difference recorded during the transporter's leg. |
| `current_performance` | `u64` | `BN` / `number` | The scaled Transporter Performance rating assigned. |

*Accounts Required:*
* `dispute` (Account `[Writable]`, *The previously initialized dispute PDA*)
* `reputation_profile` (Account `[Writable]`, *PDA mapped to the transporter to receive score deductions*)

*Throws explicitly:*
- `EvidenceWindowNotClosed`: If 48 hours hasn't elapsed.
- `AlreadyResolved`: Double-spend prevention.

---

## Deployment Requirements
Ensure `solana-cli` and `anchor-cli` are installed for deploying to Devnet.
```bash
cd programs/farm_chain_dispute
anchor build
anchor deploy
```