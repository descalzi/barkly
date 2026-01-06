from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.models import UploadResponse
from app.api.auth import get_current_user
from app.database import DBUser
import base64
from PIL import Image
import io

router = APIRouter()

# Allowed image types
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

# Maximum file size: 2MB
MAX_FILE_SIZE = 2 * 1024 * 1024


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_user)
):
    """
    Upload an image and return base64 encoded data

    Validates:
    - File type (JPEG, PNG, GIF, WebP)
    - File size (< 2MB)
    - Valid image format
    """
    # Check content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_TYPES)}"
        )

    # Read file content
    contents = await file.read()

    # Check file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    # Validate it's a real image by trying to open with PIL
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    # Convert to base64
    base64_data = base64.b64encode(contents).decode('utf-8')

    # Return with proper data URI format
    data_uri = f"data:{file.content_type};base64,{base64_data}"

    return UploadResponse(data=data_uri)
