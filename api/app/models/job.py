from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(255), nullable=True, index=True)
    title = Column(String(512), nullable=False, index=True)
    location = Column(String(255), nullable=True, index=True)
    employment_type = Column(String(100), nullable=True)
    job_url = Column(String(1024), nullable=False, unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    first_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="jobs")

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title!r}>"
