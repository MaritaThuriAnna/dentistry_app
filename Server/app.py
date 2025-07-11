from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from caries_model import detect
from pathlib import Path
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:4200"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to my caries detection API! Use POST /detect_caries to upload an image."}

@app.post("/detect_caries")
@app.post("/detect_caries/")
async def detect_caries(file: UploadFile = File(...)):
    try:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        yolo_model_path = Path(__file__).parent / "models" / "best.pt"
        unet_model_path = Path(__file__).parent / "models" / "best_model4.pth"

        result = detect(
            img_input = file_path,
            yolo_path = str(yolo_model_path),
            unet_path = str(unet_model_path),
            threshold = 0.01
        )

        os.remove(file_path)

        return {
            "output_image": result["output_image"],
            "caries_teeth": result["caries_teeth"],
            # "caries_area_ratio": result["caries_area_ratio"]
        }
    except Exception as e:
        return {"error": str(e)}
