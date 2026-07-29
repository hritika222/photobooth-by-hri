const stickers = ["♡", "✦", "★", "☼", "🎀", "🍒", "🦋", "🌷", "🪩", "☁️", "💌", "🐆"];

export default function StickerPicker({ selected, onChange }) {
  const toggle = (sticker) => {
    onChange(selected.includes(sticker)
      ? selected.filter((item) => item !== sticker)
      : [...selected, sticker].slice(0, 6)
    );
  };

  return (
    <section className="picker-section">
      <div className="section-title">
        <span>03</span>
        <div><small>tiny details, big mood</small><h3>Add stickers</h3></div>
      </div>
      <div className="sticker-grid">
        {stickers.map((sticker) => (
          <button
            key={sticker}
            className={`sticker ${selected.includes(sticker) ? "selected" : ""}`}
            onClick={() => toggle(sticker)}
            aria-label={`Sticker ${sticker}`}
          >{sticker}</button>
        ))}
      </div>
    </section>
  );
}
