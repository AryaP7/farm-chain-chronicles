import pytest
from scoring_engine import (
    produce_tier_lookup,
    calculate_expected_loss_rate,
    calculate_remaining_life,
    detect_anomaly,
    calculate_grade
)

class TestScoringEngine:

    def test_produce_tier_lookup_found(self):
        config = produce_tier_lookup("Apple")
        assert config.produce_constant == 0.5
        assert config.rejection_threshold == 90.0
        assert config.thresholds["A"] == 96.0

    def test_produce_tier_lookup_default(self):
        config = produce_tier_lookup("UnknownFruit")
        assert config.produce_constant == 1.0
        assert config.rejection_threshold == 80.0
        assert config.thresholds["A"] == 90.0

    def test_calculate_expected_loss_rate(self):
        # 0.5 * (2.5 ^ ((20 - 20) / 10)) = 0.5 * 1.0 = 0.5
        assert calculate_expected_loss_rate(0.5, 20.0) == 0.5
        # 1.5 * (2.5 ^ ((30 - 20) / 10)) = 1.5 * 2.5 = 3.75
        assert calculate_expected_loss_rate(1.5, 30.0) == 3.75

    def test_calculate_remaining_life(self):
        # (96 - 90) / 0.5 = 12.0
        assert calculate_remaining_life(96.0, 90.0, 0.5) == 12.0
        # Check negative remaining life -> 0
        assert calculate_remaining_life(88.0, 90.0, 0.5) == 0.0
        # Check 0 loss rate
        assert calculate_remaining_life(96.0, 90.0, 0.0) == 9999.0

    def test_detect_anomaly(self):
        # Normal behavior
        assert not detect_anomaly(99.0, 24.0, 0.5)
        # Normal behavior (long time, some loss) -> 2.5 days * 0.5 loss base = 1.25 expected. Actual loss = 2.0
        assert not detect_anomaly(98.0, 50.0, 0.5)
        # Anomaly (100% FRS after > 48h)
        assert detect_anomaly(100.0, 49.0, 0.5)
        # 100% early is fine, but we also check if 'expected_loss_rate' makes it an anomaly
        # 12h is less than the 24h biophysical requirement, so no anomaly
        assert not detect_anomaly(100.0, 12.0, 0.5)
        # Biophysical Anomaly: very low loss (0.01) despite high expectation (1.0 * 60h/24h = 2.5) -> expected min 0.125
        assert detect_anomaly(99.99, 60.0, 1.0)

    def test_calculate_grade_accept(self):
        result = calculate_grade("Apple", w_origin=1000.0, w_current=980.0, current_temp=20.0, transit_hours=24.0)
        assert result["score"] == 98.0
        assert result["grade"] == "A"
        assert result["action"] == "ACCEPT"
        assert result["remaining_life"] == 16.0  # (98-90)/0.5 = 16
        assert not result["anomaly_detected"]

    def test_calculate_grade_dispute_low_frs(self):
        # Strawberry rejection is 85.0
        # 840/1000 = 84% -> DISPUTE
        result = calculate_grade("Strawberry", w_origin=1000.0, w_current=840.0, current_temp=25.0, transit_hours=36.0)
        assert result["score"] == 84.0
        assert result["grade"] == "F"
        assert result["action"] == "DISPUTE"
        # remaining life should be 0 because 84 < 85
        assert result["remaining_life"] == 0.0
        assert not result["anomaly_detected"]

    def test_calculate_grade_dispute_anomaly(self):
        # Apple 1000 -> 1000 after 50 hours triggers anomaly -> DISPUTE
        result = calculate_grade("Apple", w_origin=1000.0, w_current=1000.0, current_temp=15.0, transit_hours=50.0)
        assert result["score"] == 100.0
        # Even though score is "A", it should DISPUTE due to anomaly
        assert result["grade"] == "A" 
        assert result["action"] == "DISPUTE"
        assert result["anomaly_detected"]

    def test_zero_original_weight(self):
        with pytest.raises(ValueError, match="Original weight must be greater than 0"):
            calculate_grade("Apple", w_origin=0.0, w_current=0.0, current_temp=20.0, transit_hours=24.0)
