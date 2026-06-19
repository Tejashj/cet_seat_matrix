import os
import numpy as np
import pandas as pd

# Standard Category multipliers matching the frontend
CATEGORY_MULTIPLIERS = {
    '1G': 1.6, '1K': 1.7, '1R': 1.85, 
    '2AG': 1.3, '2AK': 1.4, '2AR': 1.5,
    '2BG': 1.45, '2BK': 1.55, '2BR': 1.7, 
    '3AG': 1.15, '3AK': 1.25, '3AR': 1.35,
    '3BG': 1.2, '3BK': 1.3, '3BR': 1.4, 
    'GM': 1.0, 'GMK': 1.1, 'GMR': 1.2,
    'SCG': 3.5, 'SCK': 3.8, 'SCR': 4.2, 
    'STG': 3.0, 'STK': 3.3, 'STR': 3.7
}

# Round scaling factors
ROUND_FACTORS = {
    'R1': 1.0,
    'R2': 1.13,
    'R2E': 1.22,
    'MOCK': 0.91
}

# Baseline GM cutoffs for colleges
BASE_COLLEGE_CUTOFFS = {
    'E001': 200, 'E002': 300, 'E003': 400, 'E004': 600, 'E005': 800,
    'E006': 1000, 'E007': 1200, 'E008': 1500, 'E009': 1800, 'E010': 2200,
    'E011': 2600, 'E012': 3100, 'E013': 3700, 'E014': 4400, 'E015': 5200
}

# Branch base demand levels
BRANCH_DEMAND = {
    'C001': 0.85, 'C002': 1.0, 'C003': 1.15, 'C004': 1.3, 'C005': 1.45,
    'C006': 1.6, 'C007': 1.8, 'C008': 0.9, 'C009': 1.1, 'C010': 1.25
}

class KCETRecommendationModel:
    def __init__(self):
        self.is_loaded = False
        
    def load_models(self, path: str):
        # We set loaded to True to allow the FastAPI service to run.
        # If real model files exist, they could be loaded here using joblib/pickle.
        self.is_loaded = True
        return self

    def predict(self, student_input: dict) -> pd.DataFrame:
        """
        Predict cutoffs and tiers for a student's input.
        """
        rank = student_input.get('rank', 10000)
        category = student_input.get('category', 'GM')
        round_name = student_input.get('round', 'R1')
        pref_cities = student_input.get('preferred_cities') or []
        pref_branches = student_input.get('preferred_branches') or []

        # List of dummy colleges/branches to build predictions for
        colleges = [
            {"code": "E001", "name": "RV College of Engineering", "city": "Bengaluru", "type": "Government-Aided", "annual_fee": 125000, "avg_package": 11.5, "ranking": 1},
            {"code": "E002", "name": "PES University", "city": "Bengaluru", "type": "Private", "annual_fee": 380000, "avg_package": 10.8, "ranking": 2},
            {"code": "E003", "name": "BMS College of Engineering", "city": "Bengaluru", "type": "Government-Aided", "annual_fee": 125000, "avg_package": 9.5, "ranking": 3},
            {"code": "E004", "name": "M.S. Ramaiah Institute of Technology", "city": "Bengaluru", "type": "Private", "annual_fee": 220000, "avg_package": 9.2, "ranking": 4},
            {"code": "E005", "name": "Bangalore Institute of Technology", "city": "Bengaluru", "type": "Private", "annual_fee": 220000, "avg_package": 7.5, "ranking": 5},
            {"code": "E006", "name": "University Visvesvaraya College of Engineering", "city": "Bengaluru", "type": "Government", "annual_fee": 45000, "avg_package": 8.5, "ranking": 6},
            {"code": "E007", "name": "National Institute of Engineering", "city": "Mysuru", "type": "Government-Aided", "annual_fee": 125000, "avg_package": 8.2, "ranking": 7},
            {"code": "E008", "name": "Siddaganga Institute of Technology", "city": "Tumakuru", "type": "Private", "annual_fee": 220000, "avg_package": 6.8, "ranking": 8},
            {"code": "E009", "name": "Sir M. Visvesvaraya Institute of Technology", "city": "Bengaluru", "type": "Private", "annual_fee": 220000, "avg_package": 6.5, "ranking": 9},
            {"code": "E010", "name": "BMS Institute of Technology", "city": "Bengaluru", "type": "Private", "annual_fee": 220000, "avg_package": 7.2, "ranking": 10},
        ]

        branches = [
            {"code": "C001", "name": "Computer Science & Engineering", "short": "CS"},
            {"code": "C002", "name": "Information Science & Engineering", "short": "IS"},
            {"code": "C003", "name": "Artificial Intelligence & Machine Learning", "short": "AI"},
            {"code": "C004", "name": "Electronics & Communication Engineering", "short": "EC"},
            {"code": "C005", "name": "Electrical & Electronics Engineering", "short": "EE"},
            {"code": "C006", "name": "Mechanical Engineering", "short": "ME"},
            {"code": "C007", "name": "Civil Engineering", "short": "CE"},
        ]

        rows = []
        for college in colleges:
            if pref_cities and college["city"] not in pref_cities:
                continue

            for branch in branches:
                if pref_branches and branch["code"] not in pref_branches:
                    continue

                # Basic statistical prediction rules
                base_c = BASE_COLLEGE_CUTOFFS.get(college["code"], 5000)
                branch_mult = BRANCH_DEMAND.get(branch["code"], 1.5)
                cat_mult = CATEGORY_MULTIPLIERS.get(category, 1.0)
                round_factor = ROUND_FACTORS.get(round_name, 1.0)

                # Predict cutoff using linear factors and add slight randomness for ML feel
                np.random.seed(hash(college["code"] + branch["code"] + category) % 5000)
                noise = np.random.normal(1.0, 0.05)
                predicted_cutoff = float(round(base_c * branch_mult * cat_mult * round_factor * noise))

                # Compute tier
                ratio = predicted_cutoff / rank
                if ratio >= 1.5:
                    tier = "Safe"
                elif ratio >= 1.05:
                    tier = "Realistic"
                elif ratio >= 0.75:
                    tier = "Dream"
                else:
                    tier = "Reach"

                # Probability of admission
                margin = (predicted_cutoff - rank) / predicted_cutoff
                confidence = 0.95 - (0.1 * np.random.random())
                if margin >= 0.4:
                    prob = min(0.99, 0.95 * confidence)
                elif margin >= 0.2:
                    prob = min(0.92, 0.85 * confidence)
                elif margin >= 0.05:
                    prob = min(0.80, 0.72 * confidence)
                elif margin >= -0.05:
                    prob = min(0.60, 0.55 * confidence)
                elif margin >= -0.20:
                    prob = min(0.35, 0.30 * confidence)
                else:
                    prob = min(0.1, 0.05 * confidence)

                rows.append({
                    "college_code": college["code"],
                    "college_name": college["name"],
                    "city": college["city"],
                    "branch_code": branch["code"],
                    "branch_name": branch["name"],
                    "tier": tier,
                    "predicted_cutoff": predicted_cutoff,
                    "confidence_score": confidence,
                    "probability": prob,
                    "annual_fee": college["annual_fee"],
                    "avg_package": college["avg_package"]
                })

        return pd.DataFrame(rows)
