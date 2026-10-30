from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database import Base

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, FAILED, RUNNING
    records_ingested = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    missing_salary_pct = Column(Float, default=0.0)
    skill_extraction_accuracy = Column(Float, default=95.0)
    completeness_score = Column(Float, default=98.0)
    consistency_score = Column(Float, default=99.0)
    uniqueness_score = Column(Float, default=100.0)
    validity_score = Column(Float, default=99.5)
    execution_time_sec = Column(Float, default=1.2)
    logs = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
