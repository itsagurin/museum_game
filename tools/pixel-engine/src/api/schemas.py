"""
Pydantic schemas for the Pixel Coloring Engine REST API.
Strictly conforms to ADR-003 and ENGINEERING_BRIEF.md.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class GridModel(BaseModel):
    width: int = Field(..., description="Number of columns in the grid (N)")
    height: int = Field(..., description="Number of rows in the grid (N)")
    data: List[List[int]] = Field(..., description="2D matrix of pixel color IDs (values strictly 1..5)")


class PaletteItemModel(BaseModel):
    id: int = Field(..., ge=1, le=5, description="Color identifier (1..5)")
    hex: str = Field(..., description="Hex color code uppercase (#RRGGBB)")
    name: str = Field(..., description="Aesthetic Polish color name")


class CulturalDataModel(BaseModel):
    trivia: str = Field(..., description="Historical trivia / anecdote")
    historical_context: str = Field(..., description="Cultural significance in Polish heritage")


class ArtworkResponse(BaseModel):
    id: str = Field(..., description="Artwork slug identifier")
    title: str = Field(..., description="Artwork title")
    artist: str = Field(..., description="Artist name")
    year: str = Field(..., description="Creation year / era")
    original_image_url: str = Field(..., description="URL to high-resolution original painting")
    grid: GridModel
    palette: List[PaletteItemModel] = Field(..., min_length=5, max_length=5)
    cultural_data: CulturalDataModel


class ConvertRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image or data URI")
    n: int = Field(32, ge=4, le=128, description="Target grid size N (produces N x N grid)")
    title: Optional[str] = Field("Własne Dzieło", description="Optional title")
    artist: Optional[str] = Field("Autor Niezależny", description="Optional artist name")
    year: Optional[str] = Field("Współczesne", description="Optional creation year")
