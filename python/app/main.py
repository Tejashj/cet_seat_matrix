"""
KCET Option Entry Planner - FastAPI ML Service
Serves the XGBoost + Random Forest + Neural Network ensemble
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import uvicorn
import os

# Import prediction model (lazy loaded)
_model = None

def get_model():
    global _model
    if _model is None:
        from models.recommendation_model import KCETRecommendationModel
        _model = KCETRecommendationModel()
        model_path = os.getenv("MODEL_PATH", "./saved_models")
        try:
            _model.load_models(model_path)
        except FileNotFoundError:
            raise RuntimeError(
                f"Models not found at {model_path}. "
                "Run: python scripts/train_model.py first."
            )
    return _model


app = FastAPI(
    title="KCET Recommendation API",
    description="ML-powered KCET counseling recommendations",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_CATEGORIES = [
    '1G', '1K', '1R', '2AG', '2AK', '2AR',
    '2BG', '2BK', '2BR', '3AG', '3AK', '3AR',
    '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMR',
    'SCG', 'SCK', 'SCR', 'STG', 'STK',
]


class StudentInput(BaseModel):
    rank: int
    category: str
    gender: Optional[str] = None
    rural: bool = False
    kannada_medium: bool = False
    ph: bool = False
    ex_defence: bool = False
    preferred_cities: Optional[List[str]] = None
    preferred_branches: Optional[List[str]] = None

    @validator('rank')
    def validate_rank(cls, v):
        if not 1 <= v <= 200000:
            raise ValueError('Rank must be between 1 and 200,000')
        return v

    @validator('category')
    def validate_category(cls, v):
        if v not in VALID_CATEGORIES:
            raise ValueError(f'Invalid category. Valid: {VALID_CATEGORIES}')
        return v


class RecommendationItem(BaseModel):
    college_code: str
    college_name: str
    city: str
    branch_code: str
    branch_name: str
    tier: str
    predicted_cutoff: float
    confidence_score: float
    probability_of_admission: float
    annual_fee: int
    avg_package: float


class PredictionResponse(BaseModel):
    student_id: str
    rank: int
    category: str
    total_recommendations: int
    recommendations: List[RecommendationItem]
    dream_colleges: List[RecommendationItem]
    realistic_colleges: List[RecommendationItem]
    safe_colleges: List[RecommendationItem]
    overall_confidence: float
    prediction_timestamp: str


@app.get("/")
async def root():
    return {
        "service": "KCET Recommendation API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(student: StudentInput):
    """
    Get personalized KCET college recommendations for a student.
    
    The ML ensemble combines:
    - XGBoost (50% weight)
    - Random Forest (30% weight)  
    - Neural Network (20% weight)
    
    Returns Dream, Realistic, and Safe categories with confidence scores.
    """
    try:
        model = get_model()
        result = model.predict(student.dict())
        
        def to_item(row) -> RecommendationItem:
            return RecommendationItem(
                college_code=row['college_code'],
                college_name=row['college_name'],
                city=row.get('city', ''),
                branch_code=row['branch_code'],
                branch_name=row['branch_name'],
                tier=row['tier'],
                predicted_cutoff=float(row['predicted_cutoff']),
                confidence_score=float(row['confidence_score']),
                probability_of_admission=float(row.get('probability', 0)),
                annual_fee=int(row.get('annual_fee', 0)),
                avg_package=float(row.get('avg_package', 0)),
            )
        
        all_recs = [to_item(r) for r in result.to_dict('records')]
        dream = [r for r in all_recs if r.tier == 'Dream']
        realistic = [r for r in all_recs if r.tier == 'Realistic']
        safe = [r for r in all_recs if r.tier == 'Safe']
        
        return PredictionResponse(
            student_id=f"KCET_{student.category}_{student.rank}_{int(datetime.now().timestamp())}",
            rank=student.rank,
            category=student.category,
            total_recommendations=len(all_recs),
            recommendations=all_recs,
            dream_colleges=dream,
            realistic_colleges=realistic,
            safe_colleges=safe,
            overall_confidence=float(result['confidence_score'].mean()) if len(result) > 0 else 0.0,
            prediction_timestamp=datetime.now().isoformat(),
        )
        
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "production") == "development",
        log_level="info",
    )
