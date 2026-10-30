from fastapi import APIRouter
from app.api.dashboard import router as dashboard_router
from app.api.jobs import router as jobs_router
from app.api.skills import router as skills_router
from app.api.roles import router as roles_router
from app.api.salary import router as salary_router
from app.api.skill_gap import router as skill_gap_router
from app.api.pipeline import router as pipeline_router, data_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(jobs_router)
api_router.include_router(skills_router)
api_router.include_router(roles_router)
api_router.include_router(salary_router)
api_router.include_router(skill_gap_router)
api_router.include_router(pipeline_router)
api_router.include_router(data_router)
api_router.include_router(analytics_router)
