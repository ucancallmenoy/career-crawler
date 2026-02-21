from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.schemas.company import CompanyRead


class JobBase(BaseModel):
    title: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    job_url: str
    external_id: Optional[str] = None


class JobCreate(JobBase):
    company_id: int


class JobRead(JobBase):
    id: int
    company_id: int
    is_active: bool
    first_seen_at: datetime
    last_seen_at: datetime
    company: CompanyRead

    model_config = {"from_attributes": True}


class PaginatedJobs(BaseModel):
    items: list[JobRead]
    total: int
    page: int
    size: int
    pages: int
