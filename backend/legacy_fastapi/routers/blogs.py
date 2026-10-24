from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import BlogPost
from ..schemas import BlogPostResponse

router = APIRouter(prefix="/api/blogs", tags=["Financial Literacy & Blogs"])

@router.get("/", response_model=List[BlogPostResponse])
def get_all_blogs(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(BlogPost)
    if category and category.lower() != "all":
        query = query.filter(BlogPost.category.ilike(f"%{category}%"))
    return query.order_by(BlogPost.created_at.desc()).all()

@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post
