# 📄 ShaftScan - Smart PDF Analyzer

A full-stack document intelligence web application that lets users upload PDFs and instantly extract summaries, keywords, and searchable content using a FastAPI backend and React frontend.

---

## 🚀 Live Demo

Frontend: `https://smart-pdf-analyzer-two.vercel.app/`
Backend: `⚠️ Public API (no authentication required)`

---

## 📌 Features

* 📄 Upload PDF files
* 🧹 Automatic text extraction and cleaning
* 🔑 Keyword extraction using frequency-based NLP
* 🧾 Extractive summarization of documents
* 🔍 Search within PDF content
* ⚡ Real-time interaction between frontend and backend

---

## 🧠 How It Works

```text
PDF Upload (React)
        ↓
FastAPI Backend
        ↓
PDF Text Extraction (pypdf)
        ↓
Text Cleaning (regex processing)
        ↓
Keyword Extraction (frequency-based NLP)
        ↓
Summarization (extractive scoring)
        ↓
Search Engine (sentence matching)
        ↓
Results returned to frontend
```

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* Python
* pypdf
* scikit-learn
* NLTK
* Uvicorn

### Frontend

* React (Vite)
* Axios
* JavaScript
* HTML/CSS

---

## 📁 Project Structure

```
shaftscan/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── text_cleaner.py
│       ├── keyword_extractor.py
│       ├── summarizer.py
│       └── search_engine.py
│
├── frontend/
│   ├── src/
│   ├── App.jsx
│   └── ...
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone repository

```bash
git clone https://github.com/your-username/smart-pdf-analyzer.git
cd smart-pdf-analyzer
```

---

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Run server:

```bash
python3 -m uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API docs:

```
http://127.0.0.1:8000/docs
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---
## ⚙️ Environment Variables

Frontend requires:

VITE_API_URL= `https://shaftscan.onrender.com`

---

## 📊 API Endpoints

### `POST /upload`

Upload PDF and get:

* extracted text
* cleaned text
* keywords
* summary

---

### `POST /search`

Search within uploaded PDF content.

Request:

```json
{
  "query": "database"
}
```

Response:

```json
{
  "results": ["matching sentences..."]
}
```

---

## 🔒 Security Note

This project does not store uploaded files permanently.  
All processing happens in memory on the backend.

---

## 🧠 Key Learnings

This project demonstrates:

* Full-stack development (React + FastAPI)
* File upload handling
* Text processing & NLP basics
* API design with validation
* Frontend-backend integration
* Real-world system architecture

---

## 📸 Screenshots (will be added later)

* Upload interface
* Summary view
* Keyword output
* Search results

---

## 🚧 Future Improvements

* Semantic search using embeddings (FAISS)
* AI-based summarization (HuggingFace models)
* Multi-document support
* User authentication
* Cloud storage for PDFs
* Highlight search results in UI

---

## 👨‍💻 Author

Built by **Dipika Pandit**

* Full-stack developer in progress
* Interested in AI, cybersecurity, and system design

---

## ⭐ If you like this project

Give it a star and feel free to fork it.

---
