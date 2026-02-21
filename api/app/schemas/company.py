from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional


class CompanyBase(BaseModel):
    name: str
    career_page_url: str
    logo_url: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyRead(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
