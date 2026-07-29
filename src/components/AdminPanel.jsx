import { useState } from "react";
import { deleteCreatorPhoto, fetchCreatorGallery } from "../lib/api.js";

export default function AdminPanel({ onClose }) {
  const [password, setPassword] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [logged, setLogged] = useState(false);

  async function login(e) {
    e.preventDefault();
    try {
      const data = await fetchCreatorGallery(password);
      setPhotos(data);
      setLogged(true);
      setError("");
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm("Delete this photo from the creator gallery?")) return;
    await deleteCreatorPhoto(id, password);
    setPhotos((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <div><small>private corner</small><h2>Hri's gallery</h2></div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {!logged ? (
          <form onSubmit={login} className="admin-login">
            <p>Only photos people explicitly chose to share appear here.</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin password" />
            <button className="primary-button">enter gallery</button>
            {error && <div className="error">{error}</div>}
          </form>
        ) : (
          <div className="admin-content">
            <div className="admin-stats"><strong>{photos.length}</strong><span>shared memories</span></div>
            {photos.length === 0 ? <div className="empty-state">No shared photos yet ♡</div> : (
              <div className="admin-grid">
                {photos.map((photo) => (
                  <article className="admin-photo" key={photo.id}>
                    <img src={photo.url} alt="Shared photobooth memory" />
                    <div><small>{new Date(photo.createdAt).toLocaleString()}</small><button onClick={() => remove(photo.id)}>delete</button></div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
