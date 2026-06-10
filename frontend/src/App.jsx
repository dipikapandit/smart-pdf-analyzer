import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

function getUploadTitle(uploadState, analysisStage) {
  if (uploadState === "uploading") {
    return "Uploading...";
  }

  if (uploadState === "analyzing") {
    return "Analyzing...";
  }

  if (uploadState === "done") {
    return "Done ✓";
  }

  if (analysisStage === "extracting") {
    return "Extracting text...";
  }

  if (analysisStage === "summarizing") {
    return "Generating summary...";
  }

  return "Drop PDF here";
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
  const emptySummaryMessage = data ? "Summary will appear here after analysis." : "Upload a PDF to start analysis.";
  const emptyKeywordMessage = data ? "Keywords will appear here after analysis." : "Upload a PDF to start analysis.";
  const emptySearchMessage = !data
    ? "Upload a PDF to start analysis."
    : query.trim()
      ? "No matches found. Try a broader search term."
      : "Search inside your document above.";

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />

      <header className="topbar">
        <div>
          <p className="eyebrow">ShaftScan</p>
         
        </div>

        <div className="topbar-chip">Extract the Hidden Data</div>
      </header>

      <main className="page-content">
        <section className="upload-panel">
          <div className="hero-copy">
            <p className="eyebrow">Upload and analyze</p>
            <h2>Drop a PDF to extract insights, then search inside the document.</h2>
            <p className="hero-description">
              A focused upload experience with live processing stages, clean summaries, and searchable matches.
            </p>
          </div>

          <div
            className={`upload-card ${isDragging ? "is-dragging" : ""} ${uploadState}`}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!isBusy) {
                setIsDragging(true);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!isBusy) {
                setIsDragging(true);
              }
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);

              if (isBusy) {
                return;
              }

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

            <button
              type="button"
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
            >
              <div className="upload-icon-wrap" aria-hidden="true">
                <div className={`upload-icon ${isBusy ? "spinner" : ""}`} />
              </div>

              <div className="upload-copy">
                <span className="upload-title">{getUploadTitle(uploadState, analysisStage)}</span>
                <span className="upload-subtitle">
                  {file ? file.name : "Drag and drop a PDF, or click to browse your files."}
                </span>
              </div>

              <span className="upload-action">{file ? "Replace PDF" : "Browse files"}</span>
            </button>

            <div className="upload-meta">
              <div className="file-chip">
                <span className="file-chip-label">Selected file</span>
                <span className="file-chip-value">{file ? file.name : "No file selected"}</span>
              </div>

              <div className="status-stack" aria-live="polite">
                <span className="status-pill">{getUploadTitle(uploadState, analysisStage)}</span>
                <span className="status-detail">
                  {analysisStage === "extracting"
                    ? "Extracting text from every page."
                    : analysisStage === "summarizing"
                      ? "Generating summary and keywords."
                      : uploadState === "done"
                        ? "Analysis complete. You can now search the document."
                        : "Upload a PDF to begin."}
                </span>
              </div>

              {isBusy ? (
                <div className="processing-row">
                  <span className="loading-spinner" aria-hidden="true" />
                  <span>{analysisStage === "extracting" ? "Extracting text..." : "Generating summary..."}</span>
                </div>
              ) : null}

              {error ? <p className="feedback feedback-error">{error}</p> : null}
            </div>
          </div>
        </section>

        <section className="results-grid" aria-label="Analysis results">
          <article className="result-card summary-card">
            <div className="card-heading">
              <div>
                <p className="card-kicker">Overview</p>
                <h3>Summary</h3>
              </div>
            </div>

            {data?.summary ? (
              <p className="summary-text">{data.summary}</p>
            ) : (
              <div className="empty-state">
                <p>{emptySummaryMessage}</p>
              </div>
            )}
          </article>

          <article className="result-card keywords-card">
            <div className="card-heading">
              <div>
                <p className="card-kicker">Top terms</p>
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
                <p>{emptyKeywordMessage}</p>
              </div>
            )}
          </article>

          <article className="result-card search-card">
            <div className="card-heading card-heading-search">
              <div>
                <p className="card-kicker">Find matches</p>
                <h3>Search Results</h3>
              </div>
            </div>

            <form className="search-form" onSubmit={searchPDF}>
              <input
                className="search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search inside your document"
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
                <p>{emptySearchMessage}</p>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}