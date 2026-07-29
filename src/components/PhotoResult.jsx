import { useEffect, useState } from "react";
import { composePhoto } from "../lib/canvas.js";
import { saveToCreatorGallery } from "../lib/api.js";

export default function PhotoResult({ source, frame, stickers, onRetake, onJournal }) {
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState(null);
  const [saveCreator, setSaveCreator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    composePhoto({ source, frame, stickers, caption }).then((data) => alive && setResult(data));
    return () => { alive = false; };
  }, [source, frame, stickers, caption]);

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `photobooth-by-hri-strip-${Date.now()}.jpg`;
    a.click();
  }

  async function saveForCreator() {
    if (!result || !saveCreator) return;
    setSaving(true); setNotice("");
    try {
      await saveToCreatorGallery(result, { frame, stickers, createdAt: new Date().toISOString(), shots: source.length });
      setNotice("saved to Hri's gallery ♡");
    } catch {
      setNotice("the gallery server isn't running yet — your strip is still safe on your device.");
    } finally { setSaving(false); }
  }

  return (
    <section className="result-section">
      <div className="result-copy">
        <small>the strip is developed ✦</small>
        <h2>Four little moments.</h2>
        <p>Pick your print style, add a few stickers, then save the finished strip. The pattern stays on the paper — never over your photos.</p>
      </div>
      <div className="result-layout">
        <div className="result-preview strip-result">
          {result ? <img src={result} alt="Your four-photo photobooth strip" /> : <div className="loading-card">developing your strip…</div>}
        </div>
        <div className="result-tools">
          <label className="caption-label">little note <span>optional</span>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. friday night, no plans ♡" />
          </label>
          <div className="privacy-card">
            <div><strong>send a copy to Hri?</strong><p>Off by default. Your photos stay on your device unless you choose to share this finished strip.</p></div>
            <button className={`toggle ${saveCreator ? "on" : ""}`} onClick={() => setSaveCreator(!saveCreator)} aria-label="Save to Hri gallery"><span /></button>
          </div>
          <div className="result-buttons">
            <button className="secondary-button" onClick={onRetake}>↻ retake all four</button>
            <button className="secondary-button" onClick={onJournal} disabled={!result}>♡ scrapbook it</button>
            <button className="primary-button" onClick={download} disabled={!result}>↓ save strip</button>
          </div>
          {saveCreator && <button className="creator-save" onClick={saveForCreator} disabled={saving || !result}>{saving ? "saving…" : "save selected copy to Hri's gallery"}</button>}
          {notice && <p className="notice">{notice}</p>}
        </div>
      </div>
    </section>
  );
}
