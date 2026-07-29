const frames = [
  { id: "bubblegum", label: "Bubblegum Dots", note: "pink + cherry red" },
  { id: "zebra", label: "Zebra Ink", note: "black + ivory" },
  { id: "leopard", label: "Leopard Muse", note: "coffee + caramel" },
  { id: "cherry", label: "Cherry Club", note: "cream + red" },
  { id: "gingham", label: "Blue Gingham", note: "sky + butter" },
  { id: "chrome", label: "Silver Flash", note: "chrome + white" },
  { id: "butter", label: "Butter Baby", note: "soft yellow" },
  { id: "noir", label: "Noir Label", note: "ink + paper" }
];

export default function FramePicker({ value, onChange }) {
  return (
    <section className="picker-section">
      <div className="section-title">
        <span>02</span>
        <div><small>the strip, not the photo</small><h3>Choose your print</h3></div>
      </div>
      <p className="picker-note">Your four photos stay clean. The pattern lives on the paper around them, like a real photobooth print.</p>
      <div className="frame-grid">
        {frames.map((frame) => (
          <button key={frame.id} className={`frame-card frame-${frame.id} ${value === frame.id ? "selected" : ""}`} onClick={() => onChange(frame.id)}>
            <span className="strip-preview" aria-hidden="true">
              <i /><i /><i /><i />
              <b />
            </span>
            <strong>{frame.label}</strong>
            <small>{frame.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
