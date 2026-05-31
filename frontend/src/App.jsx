import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://127.0.0.1:8000/upload", formData);
    setData(res.data);
  };

  const searchPDF = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/search",
        { query: query },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSearchResults(res.data.results);
    } catch (err) {
      console.log("Search error:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📄 Smart PDF Analyzer</h1>

      {/* Upload */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadFile}>Upload</button>

      {/* Results */}
      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>📊 Summary</h2>
          <p>{data.summary}</p>

          <h2>🔑 Keywords</h2>
          <ul>
            {data.keywords.map((k, i) => (
              <li key={i}>{k[0]} ({k[1]})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search */}
      <div style={{ marginTop: "30px" }}>
        <h2>🔍 Search PDF</h2>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter keyword..."
        />
        <button onClick={searchPDF}>Search</button>

        <ul>
          {searchResults.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}