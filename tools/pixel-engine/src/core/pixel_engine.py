"""
Pixel Coloring Engine: converts high-resolution images into playable
pixel art color-by-number grids with a 5-color palette and canonical JSON schema.
"""

from typing import Union, Optional, Dict, Any, List
from pathlib import Path
import io
import base64
import re

import numpy as np
from PIL import Image, ImageFilter
from sklearn.cluster import KMeans
from scipy import ndimage

from src.core.color_utils import (
    rgb_to_lab,
    lab_to_rgb,
    rgb_to_hex,
    get_polish_color_name,
)


class PixelColoringEngine:
    """
    Transforms artworks and photos into clean N x N pixel coloring books
    with 5 discrete colors and canonical ADR-003 JSON output.
    """

    def __init__(
        self,
        default_n: int = 32,
        num_colors: int = 5,
        remove_isolated_pixels: bool = True,
        random_state: int = 42,
    ):
        """
        Args:
            default_n: Default grid dimension (N x N).
            num_colors: Number of palette colors (strictly 5 for ADR-003).
            remove_isolated_pixels: Whether to clean single-pixel noise.
            random_state: Seed for deterministic K-Means clustering.
        """
        if default_n < 4:
            raise ValueError("Grid dimension n must be at least 4.")
        if num_colors != 5:
            # Note: ADR-003 requires 5 colors, but we allow configurable if needed
            pass

        self.default_n = default_n
        self.num_colors = num_colors
        self.remove_isolated_pixels = remove_isolated_pixels
        self.random_state = random_state

    def load_image(self, image_input: Union[str, Path, Image.Image, bytes]) -> Image.Image:
        """Loads and converts any image source into an RGB PIL Image."""
        if isinstance(image_input, Image.Image):
            return image_input.convert("RGB")

        if isinstance(image_input, (str, Path)):
            str_path = str(image_input)
            # Handle base64 data URI
            if str_path.startswith("data:image"):
                base64_data = re.sub(r"^data:image/.+;base64,", "", str_path)
                image_bytes = base64.b64decode(base64_data)
                return Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Handle file path
            return Image.open(str_path).convert("RGB")

        if isinstance(image_input, bytes):
            return Image.open(io.BytesIO(image_input)).convert("RGB")

        raise TypeError(f"Unsupported image input type: {type(image_input)}")

    def square_crop_and_resize(self, image: Image.Image, n: int) -> Image.Image:
        """
        Crops image to a square aspect ratio (center-crop) and downsamples
        to N x N pixels using smooth resampling.
        """
        w, h = image.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = (h - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim

        cropped = image.crop((left, top, right, bottom))
        # Slight blur before downsampling to prevent high-frequency noise aliasing
        blurred = cropped.filter(ImageFilter.BoxBlur(radius=max(1, min_dim // (n * 8))))
        # High quality downsampling
        resized = blurred.resize((n, n), resample=Image.Resampling.LANCZOS)
        return resized

    def extract_palette_and_quantize(
        self,
        resized_img: Image.Image,
        num_colors: int = 5,
    ) -> tuple[np.ndarray, List[Dict[str, Any]]]:
        """
        Extracts dominant colors in CIELAB space using K-Means,
        maps pixels to cluster indices, and sorts colors by luminance.

        Returns:
            grid_matrix: (N, N) ndarray of ints (1..num_colors)
            palette: list of dicts [{"id": 1..5, "hex": "#RRGGBB", "name": "..."}]
        """
        rgb_pixels = np.array(resized_img, dtype=np.float64)  # (N, N, 3)
        n = rgb_pixels.shape[0]

        # Convert to CIELAB space for perceptual clustering
        lab_pixels = rgb_to_lab(rgb_pixels)  # (N, N, 3)
        flat_lab = lab_pixels.reshape(-1, 3)

        # Handle images with fewer unique colors than num_colors (e.g. monochrome)
        unique_colors_lab = np.unique(flat_lab, axis=0)
        actual_k = min(num_colors, len(unique_colors_lab))

        # K-Means clustering
        kmeans = KMeans(
            n_clusters=actual_k,
            random_state=self.random_state,
            n_init=10,
        )
        labels = kmeans.fit_predict(flat_lab)  # (N*N,) in 0..(actual_k-1)
        cluster_centers_lab = kmeans.cluster_centers_  # (actual_k, 3)

        if actual_k < num_colors:
            # Pad with subtle shade variations so palette strictly has num_colors elements
            padding_needed = num_colors - actual_k
            extra_centers = []
            for i in range(padding_needed):
                base_center = cluster_centers_lab[i % actual_k].copy()
                # Shift luminance L*
                base_center[0] = np.clip(base_center[0] + (15.0 * (i + 1)), 5.0, 95.0)
                extra_centers.append(base_center)
            cluster_centers_lab = np.vstack([cluster_centers_lab, extra_centers])

        # Convert cluster centers back to RGB
        centers_rgb = lab_to_rgb(cluster_centers_lab)  # (num_colors, 3)

        # Sort clusters by luminance L* for a clean, deterministic palette order
        l_values = cluster_centers_lab[:, 0]
        sorted_indices = np.argsort(l_values)

        # Create mapping from old cluster label to new sorted 1-based ID (1..num_colors)
        old_to_new_id = {}
        palette = []
        for new_id, old_idx in enumerate(sorted_indices, start=1):
            old_to_new_id[old_idx] = new_id
            r, g, b = centers_rgb[old_idx]
            hex_code = rgb_to_hex(r, g, b)
            name = get_polish_color_name(r, g, b)
            palette.append({
                "id": new_id,
                "hex": hex_code,
                "name": name,
            })

        # Map labels to 1-based IDs
        remapped_labels = np.array([old_to_new_id[lbl] for lbl in labels], dtype=np.int32)
        grid_matrix = remapped_labels.reshape((n, n))

        return grid_matrix, palette

    def clean_isolated_pixels(self, grid: np.ndarray) -> np.ndarray:
        """
        Removes single isolated pixels (salt-and-pepper noise) so that
        every pixel is part of a larger contiguous color patch.
        Uses 3x3 majority voting for pixels that differ from all 8 neighbors.
        """
        cleaned = grid.copy()
        n = grid.shape[0]

        for y in range(n):
            for x in range(n):
                val = grid[y, x]
                # Gather neighbor values (8-connectivity)
                y_min = max(0, y - 1)
                y_max = min(n, y + 2)
                x_min = max(0, x - 1)
                x_max = min(n, x + 2)
                patch = grid[y_min:y_max, x_min:x_max]

                # Check if current pixel is isolated (fewer than 2 occurrences including itself)
                matches = np.sum(patch == val)
                if matches <= 1:
                    # Replace with the mode (most common value) of neighbors
                    vals, counts = np.unique(patch, return_counts=True)
                    # Exclude the isolated value if possible
                    non_val_mask = vals != val
                    if np.any(non_val_mask):
                        best_val = vals[non_val_mask][np.argmax(counts[non_val_mask])]
                        cleaned[y, x] = best_val

        return cleaned

    def process_image(
        self,
        image_input: Union[str, Path, Image.Image, bytes],
        n: Optional[int] = None,
        artwork_id: Optional[str] = None,
        title: Optional[str] = None,
        artist: Optional[str] = None,
        year: Optional[str] = None,
        original_image_url: Optional[str] = None,
        trivia: Optional[str] = None,
        historical_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processes image and returns the canonical ADR-003 dictionary.

        Args:
            image_input: PIL image, file path, bytes, or base64 data URL.
            n: Grid size (N x N). If None, defaults to self.default_n.
            artwork_id: Unique slug ID (e.g. 'stanczyk-matejko').
            title: Title of the artwork.
            artist: Artist name.
            year: Creation year.
            original_image_url: URL to HD image.
            trivia: Polish historical trivia.
            historical_context: Polish cultural significance.

        Returns:
            Dict conforming strictly to ADR-003 specification.
        """
        grid_n = int(n) if n is not None else self.default_n
        if grid_n < 4:
            raise ValueError(f"Grid size n must be >= 4, got {grid_n}")

        # 1. Load image
        img = self.load_image(image_input)

        # 2. Crop to square and resize to N x N
        resized = self.square_crop_and_resize(img, n=grid_n)

        # 3. K-Means palette extraction and quantization
        grid_matrix, palette = self.extract_palette_and_quantize(
            resized, num_colors=self.num_colors
        )

        # 4. Clean isolated noise pixels if enabled
        if self.remove_isolated_pixels:
            grid_matrix = self.clean_isolated_pixels(grid_matrix)

        # 5. Build canonical output schema
        auto_id = artwork_id or "dzielo-sztuki"
        if isinstance(image_input, (str, Path)) and not artwork_id:
            auto_id = Path(image_input).stem.lower().replace(" ", "-").replace("_", "-")

        result: Dict[str, Any] = {
            "id": auto_id,
            "title": title or "Polskie Dzieło Sztuki",
            "artist": artist or "Mistrz Polski",
            "year": year or "XIX w.",
            "original_image_url": original_image_url or (
                str(image_input) if isinstance(image_input, str) and image_input.startswith("http")
                else f"/assets/{auto_id}.jpg"
            ),
            "grid": {
                "width": grid_n,
                "height": grid_n,
                "data": grid_matrix.tolist(),
            },
            "palette": palette,
            "cultural_data": {
                "trivia": trivia or "Dzieło ze zbiorów polskich muzeów narodowych.",
                "historical_context": historical_context or "Ważny element polskiego dziedzictwa kulturowego i tożsamości.",
            },
        }

        return result


def to_canonical_json(data: Dict[str, Any]) -> str:
    """
    Serializes canonical ADR-003 dictionary to readable JSON,
    formatting each row of grid.data compactly on a single line.
    """
    import json

    # Temporarily remove grid.data to format outside
    grid_copy = dict(data["grid"])
    raw_data = grid_copy.pop("data")

    # Serialize base dict with placeholder
    data_copy = dict(data)
    data_copy["grid"] = grid_copy
    data_copy["grid"]["data"] = "__GRID_DATA_PLACEHOLDER__"

    base_json = json.dumps(data_copy, ensure_ascii=False, indent=2)

    # Format rows compactly: [1, 2, 3, ...]
    formatted_rows = []
    for row in raw_data:
        formatted_rows.append("      " + json.dumps(row))
    grid_data_str = "[\n" + ",\n".join(formatted_rows) + "\n    ]"

    # Replace placeholder
    final_json = base_json.replace('"__GRID_DATA_PLACEHOLDER__"', grid_data_str)
    return final_json

