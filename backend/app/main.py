from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import os
from pypdf import PdfReader
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware


from app.text_cleaner import clean_text
from app.keyword_extractor import extract_keywords
from app.search_engine import search_text
from app.summarizer import summarize_text


class SearchRequest(BaseModel):
    query: str


app = FastAPI()
global_text_storage = ""

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Smart PDF Analyzer API Running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Save file
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    cleaned_text = clean_text(text)
    global global_text_storage
    global_text_storage = cleaned_text

    keywords = extract_keywords(cleaned_text)

    summary = summarize_text(cleaned_text)

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "raw_text_sample": text[:800],
        "cleaned_text": cleaned_text[:800],
        "keywords": keywords,
        "summary": summary
    }

@app.post("/search")
def search_pdf(request: SearchRequest):
    query = request.query.lower()

    if not global_text_storage:
        return {"error": "No PDF uploaded yet"}

    sentences = global_text_storage.split(". ")

    results = [
        s.strip()
        for s in sentences
        if query in s.lower()
    ]

    return {
        "query": query,
        "results": results[:10]
    }

