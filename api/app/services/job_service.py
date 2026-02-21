import math

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.job import Job
from app.schemas.job import JobCreate, PaginatedJobs


def get_jobs(
    db: Session,
    search: str | None = None,
    location: str | None = None,
    company_id: int | None = None,
    page: int = 1,
    size: int = 20,
) -> PaginatedJobs:
    query = db.query(Job).options(joinedload(Job.company)).filter(Job.is_active == True)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Job.title.ilike(pattern),
                Job.location.ilike(pattern),
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if company_id:
        query = query.filter(Job.company_id == company_id)

    total = query.count()
    pages = math.ceil(total / size) if size else 1
    offset = (page - 1) * size

    items = query.order_by(Job.last_seen_at.desc()).offset(offset).limit(size).all()

    return PaginatedJobs(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    return (
        db.query(Job)
        .options(joinedload(Job.company))
        .filter(Job.id == job_id)
        .first()
    )


def create_job(db: Session, payload: JobCreate) -> Job:
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
