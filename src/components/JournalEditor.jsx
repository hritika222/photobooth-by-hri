import { useEffect, useState } from "react";
import { composePhoto } from "../lib/canvas.js";

export default function JournalEditor({ photo, frame, stickers, onBack, onDone }) {
  const [text, setText] = useState("a tiny page from a very cute day ♡");
  const [strip, setStrip] = useState(null);

  useEffect(() => {
    let alive = true;
    composePhoto({ source: photo, frame, stickers }).then((data) => alive && setStrip(data));
    return () => { alive = false; };
  }, [photo, frame, stickers]);

  return (
    <section className="journal-editor">
      <div className="journal-heading">
        <div><small>the scrapbook corner</small><h2>Turn the strip into a page.</h2></div>
        <button className="text-button" onClick={onBack}>← back to strip</button>
      </div>
      <div className="journal-paper">
        <div className="journal-photo">
          {strip ? <img src={strip} alt="Your four-photo photobooth strip" /> : <div className="journal-loading">developing strip…</div>}
          <div className="paper-pin" />
          <span className="tape-piece" />
        </div>
        <div className="journal-copy">
          <span className="hand-label">dear little memory,</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={140} />
          <div className="journal-line" />
          <span className="journal-date">{new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>
      <div className="journal-actions">
        <button className="secondary-button" onClick={onBack}>change print style</button>
        <button className="primary-button" onClick={() => onDone({ text })} disabled={!strip}>save my journal page ✦</button>
      </div>
    </section>
  );
}
