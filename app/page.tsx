"use client";

import { useEffect, useState } from "react";

type PageItem = { id: string; name: string };

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pages, setPages] = useState<PageItem[] | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect auth on load
    fetch("/api/facebook/pages")
      .then(async (res) => {
        if (res.status === 401) {
          setPages(null);
          return [] as PageItem[];
        }
        const data = await res.json();
        setPages(data.pages || []);
        if (data.pages?.[0]?.id) setSelectedPage(data.pages[0].id);
        return data.pages as PageItem[];
      })
      .catch(() => setPages(null));
  }, []);

  const onGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setImageBase64(data.imageBase64);
    } catch (e: any) {
      setError(e.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const onUpload = async () => {
    if (!imageBase64) return;
    if (!selectedPage) {
      setError("Select a Facebook Page first");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/facebook/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPage, caption, imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      alert("Uploaded to Facebook Page successfully.");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isAuthed = Array.isArray(pages);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      {error && (
        <div style={{ marginBottom: 12, color: "#ff8080" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="row">
        <div style={{ flex: 1, minWidth: 280 }}>
          <label>Prompt</label>
          <textarea
            rows={4}
            placeholder="A photorealistic image of a golden retriever surfing at sunset"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={onGenerate} disabled={generating || !prompt.trim()}>
              {generating ? "Generating?" : "Generate Image"}
            </button>
            <button
              className="secondary"
              onClick={() => setImageBase64(null)}
              disabled={!imageBase64}
            >
              Clear
            </button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <label>Preview</label>
          <div style={{ minHeight: 200 }}>
            {imageBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="preview"
                alt="Generated preview"
                src={`data:image/png;base64,${imageBase64}`}
              />
            ) : (
              <div style={{ opacity: 0.7 }}>No image yet.</div>
            )}
          </div>
        </div>
      </div>

      <hr />

      <div className="row">
        <div style={{ flex: 1, minWidth: 280 }}>
          <label>Facebook</label>
          {isAuthed ? (
            <div>
              <div style={{ marginBottom: 8 }}>Logged in. Select a Page:</div>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
              >
                {(pages || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  className="secondary"
                  onClick={async () => {
                    await fetch("/api/facebook/logout", { method: "POST" });
                    setPages(null);
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8 }}>Connect to Facebook:</div>
              <button onClick={() => (window.location.href = "/api/facebook/login")}>Log in with Facebook</button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <label>Caption</label>
          <input
            placeholder="Optional caption for the post"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={onUpload} disabled={!imageBase64 || !isAuthed || uploading}>
              {uploading ? "Uploading?" : "Upload to Facebook Page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
