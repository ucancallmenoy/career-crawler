from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.company import CompanyCreate, CompanyRead
from app.services import company_service

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    return company_service.get_companies(db)


@router.get("/{company_id}", response_model=CompanyRead)
def read_company(company_id: int, db: Session = Depends(get_db)):
    company = company_service.get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("", response_model=CompanyRead, status_code=201)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    existing = company_service.get_company_by_name(db, payload.name)
    if existing:
        raise HTTPException(status_code=409, detail="Company already exists")
    return company_service.create_company(db, payload)
