from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class ProduceConfig:
    produce_constant: float
    rejection_threshold: float
    thresholds: Dict[str, float]

def produce_tier_lookup(produce_type: str) -> ProduceConfig:
    """
    Returns the configuration for a given produce type.
    Includes produce_constant (for expected loss calculation),
    rejection_threshold (below which it's DISPUTE),
    and grading thresholds.
    """
    _CONFIGS = {
        "Apple": ProduceConfig(
            produce_constant=0.5,
            rejection_threshold=90.0,
            thresholds={"A": 96.0, "B": 93.0, "C": 90.0}
        ),
        "Strawberry": ProduceConfig(
            produce_constant=1.5,
            rejection_threshold=85.0,
            thresholds={"A": 92.0, "B": 88.0, "C": 85.0}
        )
    }
    # Simple default for unknown produce
    return _CONFIGS.get(produce_type, ProduceConfig(
        produce_constant=1.0,
        rejection_threshold=80.0,
        thresholds={"A": 90.0, "B": 85.0, "C": 80.0}
    ))

def calculate_expected_loss_rate(produce_constant: float, current_temp: float, q10_coefficient: float = 2.5, ref_temp: float = 20.0) -> float:
    """
    Calculates the PDEE expected loss rate using state-of-the-art Q10 biophysical kinetics.
    Decay and water loss scale exponentially with temperature, not linearly.
    Expected_Loss_Rate = Produce_Constant * (Q10 ^ ((Current_Temp - Ref_Temp) / 10))
    """
    return produce_constant * (q10_coefficient ** ((current_temp - ref_temp) / 10.0))

def calculate_remaining_life(current_frs: float, rejection_threshold: float, expected_loss_rate: float) -> float:
    """
    Calculates the PDEE remaining life.
    Remaining_Life = (Current_FRS - Rejection_Threshold) / Expected_Loss_Rate
    """
    if expected_loss_rate <= 0:
        # If the expected loss is 0 (e.g. perfect freezing temp), remaining life is theoretically infinite.
        # We can return a large max value or handle it safely.
        return 9999.0
    return max(0.0, (current_frs - rejection_threshold) / expected_loss_rate)

def detect_anomaly(current_frs: float, transit_hours: float, expected_loss_rate: float) -> bool:
    """
    State-of-the-Art Anti-Tampering Check:
    1. Base rule: Flags if Current_FRS remains 100% after 48 hours.
    2. Dynamic rule: If the actual physiological weight loss is profoundly 
       below the biophysical minimum expected over a long transit duration
       (e.g., actual loss < 5% of theoretical expectations over 24h), it flags 
       for artificial hydration/waxing tampering.
    """
    # Base 48h 100% FRS spec
    if current_frs >= 100.0 and transit_hours > 48.0:
        return True
        
    # Dynamic biophysical check (if transit is significant)
    if transit_hours > 24.0:
        theoretical_loss = expected_loss_rate * (transit_hours / 24.0) # approx loss per day depending on const
        actual_loss = max(0.0, 100.0 - current_frs)
        # If the actual loss is less than 5% of the *expected minimum*, it's unnaturally preserved.
        if actual_loss < (theoretical_loss * 0.05):
            return True

    return False

def calculate_grade(produce_type: str, w_origin: float, w_current: float, current_temp: float, transit_hours: float) -> Dict[str, Any]:
    """
    Core engine function calculating the overall Freshness Rate Score (FRS),
    grade, Remaining Life, and tracking Preservative Anomalies.
    """
    if w_origin <= 0:
        raise ValueError("Original weight must be greater than 0")

    # 1. Freshness Rate Score Calculate
    frs = (w_current / w_origin) * 100.0
    # Floating point precision safe clamp
    frs = min(100.0, frs)

    # 2. Configuration Lookup
    config = produce_tier_lookup(produce_type)

    # 3. Expected Loss Rate & Remaining Life (PDEE Algorithm using Q10 Kinetics)
    loss_rate = calculate_expected_loss_rate(config.produce_constant, current_temp)
    remaining_life = calculate_remaining_life(frs, config.rejection_threshold, loss_rate)

    # 4. Anomaly Detection (Preservative Artificial Hydration / Wax Check)
    has_anomaly = detect_anomaly(frs, transit_hours, loss_rate)

    # 5. Determine Grade
    assigned_grade = "F"
    # Find the highest grade threshold the frs meets
    for g, threshold in sorted(config.thresholds.items(), key=lambda item: item[1], reverse=True):
        if frs >= threshold:
            assigned_grade = g
            break

    # 6. Action Flag (Triggers Module 4)
    # Also trigger dispute if anomaly is detected
    if has_anomaly or frs < config.rejection_threshold:
        action = "DISPUTE"
    else:
        action = "ACCEPT"

    return {
        "score": frs,
        "grade": assigned_grade,
        "action": action,
        "remaining_life": remaining_life,
        "anomaly_detected": has_anomaly
    }
