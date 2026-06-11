import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const FEATURES = [
  { icon: "✦", label: "Smart Summary" },
  { icon: "◈", label: "Keyword Extraction" },
  { icon: "⬡", label: "Full Text Search" },
  { icon: "⚡", label: "Instant Insights" },
  { icon: "△", label: "Fast Processing" },
];

const SAMPLE_KEYWORDS = ["Database", "AI", "Analytics", "Search", "Machine Learning"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text, query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return text;
  }

  const segments = text.split(new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig"));

  return segments.map((segment, index) =>
    index % 2 === 1 ? (
      <mark key={`${segment}-${index}`} className="search-highlight">
        {segment}
      </mark>
    ) : (
      <span key={`${segment}-${index}`}>{segment}</span>
    )
  );
}

function getKeywordLabel(keyword) {
  if (Array.isArray(keyword)) {
    return keyword[0];
  }

  if (typeof keyword === "string") {
    return keyword;
  }

  return keyword?.keyword ?? "";
}

function getKeywordCount(keyword) {
  if (Array.isArray(keyword)) {
    return keyword[1];
  }

  return keyword?.count ?? null;
}

function getUploadStatusText(uploadState, analysisStage) {
  if (uploadState === "uploading") return "Uploading your PDF…";
  if (analysisStage === "extracting") return "Extracting text from every page…";
  if (analysisStage === "summarizing") return "Generating summary & keywords…";
  if (uploadState === "done") return "Analysis complete ✓";
  return null;
}

function getUploadProgress(uploadState, analysisStage) {
  if (uploadState === "uploading") return 20;
  if (analysisStage === "extracting") return 50;
  if (analysisStage === "summarizing") return 80;
  if (uploadState === "done") return 100;
  return 0;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [uploadState, setUploadState] = useState("idle");
  const [analysisStage, setAnalysisStage] = useState("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const fileInputRef = useRef(null);
  const timeoutRef = useRef([]);

  const clearTimers = () => {
    timeoutRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const schedule = (callback, delay) => {
    const timeoutId = window.setTimeout(callback, delay);
    timeoutRef.current.push(timeoutId);
    return timeoutId;
  };

  const resetSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSelectedResultIndex(0);
  };

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setError("");
    setData(null);
    setSearchResults([]);
    setSelectedResultIndex(0);
    setUploadState("uploading");
    setAnalysisStage("uploading");
    clearTimers();

    schedule(() => {
      setUploadState("analyzing");
      setAnalysisStage("extracting");
    }, 700);

    schedule(() => {
      setAnalysisStage("summarizing");
    }, 1400);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadRequest = axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const minimumLoadingTime = new Promise((resolve) => {
      schedule(resolve, 1800);
    });

    try {
      const res = await uploadRequest;
      await minimumLoadingTime;

      setData(res.data);
      setUploadState("done");
      setAnalysisStage("done");
      clearTimers();
    } catch (err) {
      console.log("Upload error:", err);
      clearTimers();
      setUploadState("idle");
      setAnalysisStage("idle");
      setError("Upload failed. Please try another PDF.");
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }

    setFile(selectedFile);
    resetSearch();
    uploadFile(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const searchPDF = async (event) => {
    event.preventDefault();

    if (!query.trim() || !data || uploadState === "uploading" || uploadState === "analyzing") {
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/search`, { query }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSearchResults(res.data.results ?? []);
      setSelectedResultIndex(0);
      setError("");
    } catch (err) {
      console.log("Search error:", err);
      setError("Search failed. Try a different keyword.");
    }
  };

  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  const activeSearchResult = searchResults[selectedResultIndex];
  const isBusy = uploadState === "uploading" || uploadState === "analyzing";
  const statusText = getUploadStatusText(uploadState, analysisStage);
  const progress = getUploadProgress(uploadState, analysisStage);
  const hasResults = data !== null;

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />
      <div className="backdrop backdrop-three" />

      {/* ── Header ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <img src="/logo.png" alt="ShaftScan" className="logo" />
        </div>
        <nav className="topbar-nav">
          <span className="topbar-chip">
            <span className="chip-dot" />
            Built with Python
          </span>
        </nav>
      </header>

      <main className="page-content">
        {/* ── Hero Section ── */}
        <section className="hero">
          <p className="hero-eyebrow">Illuminate · Map · Extract</p>
          <h1 className="hero-headline">
            From PDFs to<br />
            <span className="hero-accent">Structured Intelligence.</span>
          </h1>
          <p className="hero-sub">
            Scan PDFs like a searchlight in a dark shaft. Extract summaries,
            keywords, and searchable content in seconds.
          </p>

          {/* Feature badges */}
          <div className="feature-badges">
            {FEATURES.map((f) => (
              <span className="feature-badge" key={f.label}>
                <span className="badge-icon">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── Upload Section ── */}
        <section className="upload-section">
          <div
            className={`upload-zone ${isDragging ? "is-dragging" : ""} ${isBusy ? "is-busy" : ""} ${uploadState === "done" ? "is-done" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isBusy) setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isBusy) setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (isBusy) return;
              const droppedFile = event.dataTransfer.files?.[0];
              handleFileSelection(droppedFile);
            }}
          >
            <input
              ref={fileInputRef}
              className="file-input"
              type="file"
              accept="application/pdf"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
            />

            {/* Idle state */}
            {uploadState === "idle" && !file && (
              <div className="upload-idle">
                <div className="upload-icon-ring">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="upload-text">
                  <span className="upload-primary">Drop your PDF here or click to browse</span>
                  <span className="upload-hint">Supports any standard PDF document</span>
                </div>
                <button
                  type="button"
                  className="upload-cta"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload PDF
                </button>
              </div>
            )}

            {/* Processing state */}
            {isBusy && (
              <div className="upload-processing">
                <div className="progress-ring">
                  <svg viewBox="0 0 48 48" className="progress-svg">
                    <circle className="progress-bg" cx="24" cy="24" r="20" />
                    <circle
                      className="progress-fill"
                      cx="24" cy="24" r="20"
                      style={{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }}
                    />
                  </svg>
                  <span className="progress-percent">{progress}%</span>
                </div>
                <div className="upload-text">
                  <span className="upload-primary">{statusText}</span>
                  <span className="upload-hint">{file?.name}</span>
                </div>
              </div>
            )}

            {/* Done / has file state */}
            {uploadState === "done" && (
              <div className="upload-complete">
                <div className="done-check">✓</div>
                <div className="upload-text">
                  <span className="upload-primary">Analysis Complete</span>
                  <span className="upload-hint">{file?.name}</span>
                </div>
                <button
                  type="button"
                  className="upload-replace"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Analyze Another
                </button>
              </div>
            )}

            {/* Idle but has file (after error reset etc.) */}
            {uploadState === "idle" && file && (
              <div className="upload-idle">
                <div className="upload-icon-ring">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="upload-text">
                  <span className="upload-primary">Drop your PDF here or click to browse</span>
                  <span className="upload-hint">{file.name}</span>
                </div>
                <button
                  type="button"
                  className="upload-cta"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload PDF
                </button>
              </div>
            )}
          </div>

          {error ? <p className="upload-error">{error}</p> : null}
        </section>

        {/* ── Sample Preview (shown before upload) ── */}
        {!hasResults && !isBusy && (
          <section className="preview-section" aria-label="What you'll get">
            <p className="section-label">What you'll get</p>
            <div className="preview-grid">
              <article className="preview-card">
                <div className="preview-header">
                  <span className="preview-icon">📄</span>
                  <div>
                    <p className="card-kicker">Carefully Mapped</p>
                    <h3>Summary</h3>
                  </div>
                </div>
                <p className="preview-text">
                  "This document discusses the implementation of machine learning pipelines
                  for real-time data processing, covering architecture decisions, model
                  selection criteria, and deployment strategies…"
                </p>
              </article>

              <article className="preview-card">
                <div className="preview-header">
                  <span className="preview-icon">◈</span>
                  <div>
                    <p className="card-kicker">Extracted</p>
                    <h3>Top Keywords</h3>
                  </div>
                </div>
                <div className="keyword-cloud">
                  {SAMPLE_KEYWORDS.map((kw) => (
                    <span className="keyword-pill sample" key={kw}>{kw}</span>
                  ))}
                </div>
              </article>

              <article className="preview-card preview-card-search">
                <div className="preview-header">
                  <span className="preview-icon">⬡</span>
                  <div>
                    <p className="card-kicker">Deep</p>
                    <h3>Full Text Search</h3>
                  </div>
                </div>
                <div className="preview-search-mock">
                  <div className="mock-input">
                    <span>Search your document…</span>
                    <span className="mock-btn">Search</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}

        {/* ── Results (shown after upload) ── */}
        {hasResults && (
          <section className="results-grid" aria-label="Analysis results">
            <article className="result-card summary-card">
              <div className="card-heading">
                <div>
                  <p className="card-kicker">AI-Generated Overview</p>
                  <h3>Summary</h3>
                </div>
              </div>

              {data?.summary ? (
                <p className="summary-text">{data.summary}</p>
              ) : (
                <div className="empty-state">
                  <p>Summary will appear here after analysis.</p>
                </div>
              )}
            </article>

            <article className="result-card keywords-card">
              <div className="card-heading">
                <div>
                  <p className="card-kicker">Extracted Terms</p>
                  <h3>Keywords</h3>
                </div>
              </div>

              {keywords.length > 0 ? (
                <div className="keyword-cloud">
                  {keywords.map((keyword, index) => {
                    const label = getKeywordLabel(keyword);
                    const count = getKeywordCount(keyword);

                    return (
                      <span className="keyword-pill" key={`${label}-${index}`}>
                        <span>{label}</span>
                        {count !== null ? <span className="keyword-count">{count}</span> : null}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Keywords will appear here after analysis.</p>
                </div>
              )}
            </article>

            <article className="result-card search-card">
              <div className="card-heading">
                <div>
                  <p className="card-kicker">Deep Search</p>
                  <h3>Search Results</h3>
                </div>
              </div>

              <form className="search-form" onSubmit={searchPDF}>
                <input
                  className="search-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search inside your document…"
                  disabled={!data || isBusy}
                />
                <button className="search-button" type="submit" disabled={!data || !query.trim() || isBusy}>
                  Search
                </button>
              </form>

              {searchResults.length > 0 ? (
                <div className="search-results">
                  <div className="selected-result">
                    <span className="selected-label">Highlighted match</span>
                    <p>{renderHighlightedText(activeSearchResult, query)}</p>
                  </div>

                  <ul className="search-list">
                    {searchResults.map((result, index) => (
                      <li key={`${result}-${index}`}>
                        <button
                          type="button"
                          className={`search-list-item ${selectedResultIndex === index ? "is-active" : ""}`}
                          onClick={() => setSelectedResultIndex(index)}
                        >
                          {renderHighlightedText(result, query)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="empty-state empty-state-search">
                  <p>{query.trim() ? "No matches found. Try a broader search term." : "Search inside your document above."}</p>
                </div>
              )}
            </article>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">ShaftScan</span>
          <span className="footer-sep">·</span>
          <span className="footer-tech">PyMuPDF · OCR · NLP · Python</span>
          <span className="footer-sep">·</span>
          <span className="footer-credit">Crafted by Dipika Pandit</span>
        </div>
      </footer>
    </div>
  );
}