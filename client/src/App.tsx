import { useState } from "react";

import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("http://localhost:3000/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Failed to fetch summary");

      const data = await response.json();
      setSummary(data.summary || "No summary returned");
      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="title-container">
        <img src="/logo.png" alt="app logo" className="title-logo" />
        <h1 className="title-text">TL;DR Summarizer</h1>
      </div>

      <input
        type="text"
        className="url-input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a webpage URL"
      />
      <button
        className="summarize-btn"
        onClick={handleSummarize}
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* 모달 */}
      {showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 로고 추가 */}
      <img src="/logo.png" alt="app logo" className="modal-logo" />
      {/* 닫기 버튼 */}
      <button className="close-icon" onClick={() => setShowModal(false)}>
        ✕
      </button>

      <h2 style={{ color: "#3b82f6" }}>Summary</h2>
      <p>{summary}</p>
    </div>
  </div>
)}

    </div>
  );
}

export default App;
