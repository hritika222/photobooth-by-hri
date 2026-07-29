import { useState } from "react";
import CameraBooth from "./components/CameraBooth.jsx";
import FramePicker from "./components/FramePicker.jsx";
import StickerPicker from "./components/StickerPicker.jsx";
import PhotoResult from "./components/PhotoResult.jsx";
import JournalEditor from "./components/JournalEditor.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { composePhoto } from "./lib/canvas.js";

export default function App() {
  const [frame, setFrame] = useState("polka");
  const [stickers, setStickers] = useState([]);
  const [photo, setPhoto] = useState([]);
  const [mode, setMode] = useState("booth");
  const [adminOpen, setAdminOpen] = useState(false);
  const [journalPreview, setJournalPreview] = useState(null);

  function handleCapture(data) {
    setPhoto(data);
    setMode("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retake() {
    setPhoto([]);
    setMode("booth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finishJournal({ text }) {
    const result = await composePhoto({ source: photo, frame, stickers, caption: text, journal: true });
    setJournalPreview(result);
    setMode("journal-result");
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => { setMode("booth"); setPhoto([]); }}>
          <span className="brand-mark">H</span>
          <span>photobooth <i>by hri</i></span>
        </a>
        <nav>
          <a href="#how">how it works</a>
          <a href="#styles">frames</a>
          <button onClick={() => setAdminOpen(true)}>hri's gallery ↗</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-pattern pattern-polka" />
          <div className="hero-copy">
            <p className="eyebrow">a tiny internet photobooth · made in kathmandu</p>
            <h1>make a little<br /><em>memory.</em></h1>
            <p className="hero-text">Come for the cute frames. Stay for the scrapbook page. Take a photo, make it yours, and keep the moment.</p>
            <a className="hero-cta" href="#booth">enter the booth <span>↓</span></a>
          </div>
          <div className="hero-card">
            <div className="fake-strip">
              <div className="fake-photo photo-one">✦</div>
              <div className="fake-photo photo-two">♡</div>
              <div className="fake-photo photo-three">☼</div>
              <div className="strip-label">PHOTObooth<br /><small>by HRI</small></div>
            </div>
            <span className="hero-sticker">say cheese!</span>
          </div>
        </section>

        <section id="booth" className="booth-wrap">
          {mode === "booth" && <>
            <div className="section-intro">
              <span className="pill">the booth</span>
              <h2>Let's make something cute.</h2>
              <p>No account. No pressure. Just your camera, a timer and a little main-character energy.</p>
            </div>
            <CameraBooth onCapture={handleCapture} />
            <div id="styles" className="edit-grid">
              <FramePicker value={frame} onChange={setFrame} />
              <StickerPicker selected={stickers} onChange={setStickers} />
            </div>
          </>}

          {mode === "result" && (
            <PhotoResult
              source={photo}
              frame={frame}
              stickers={stickers}
              onRetake={retake}
              onJournal={() => setMode("journal")}
            />
          )}

          {mode === "journal" && (
            <JournalEditor photo={photo} frame={frame} stickers={stickers} onBack={() => setMode("result")} onDone={finishJournal} />
          )}

          {mode === "journal-result" && (
            <section className="journal-result">
              <div className="result-copy">
                <small>your little page is finished</small>
                <h2>Put it somewhere you'll find it later.</h2>
                <p>Download the journal page to your device. This version isn't uploaded anywhere unless you choose to share it separately.</p>
              </div>
              <img src={journalPreview} alt="Journal-style photobooth page" />
              <div className="journal-actions">
                <button className="secondary-button" onClick={() => setMode("journal")}>← edit page</button>
                <a className="primary-button" href={journalPreview} download={`photobooth-by-hri-journal-${Date.now()}.jpg`}>↓ save journal page</a>
                <button className="text-button" onClick={retake}>take another memory</button>
              </div>
            </section>
          )}
        </section>

        <section id="how" className="how-section">
          <div className="section-intro"><span className="pill">how it works</span><h2>Four shots. One strip.</h2></div>
          <div className="steps">
            <article><span>01</span><h3>Pose once.</h3><p>Choose 3, 5 or 10 seconds and the booth counts down for every shot.</p></article>
            <article><span>02</span><h3>Get four pics.</h3><p>The camera rolls through a classic four-shot sequence automatically.</p></article>
            <article><span>03</span><h3>Style the strip.</h3><p>Choose a print, add stickers and write a tiny caption after shooting.</p></article>
            <article><span>04</span><h3>Keep the memory.</h3><p>Save it to your own gallery, or opt in to share a copy with Hri.</p></article>
          </div>
        </section>

        <section className="privacy-section">
          <span>♡</span>
          <div><h3>Your photo, your choice.</h3><p>Nothing is sent to Hri's gallery by default. The share option is off until you choose it. Camera access is only used for the booth.</p></div>
        </section>
      </main>

      <footer><span>PHOTObooth by HRI</span><span>made for silly little memories ♡</span><button onClick={() => setAdminOpen(true)}>creator login</button></footer>
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
