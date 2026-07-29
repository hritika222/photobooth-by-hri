import { useEffect, useRef, useState } from "react";

const TOTAL_SHOTS = 4;

export default function CameraBooth({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(null);
  const [shot, setShot] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("camera sleeping…");

  useEffect(() => {
    startCamera();
    return () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    try {
      setMessage("asking for camera access…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setReady(true);
      setMessage("camera ready ♡");
    } catch {
      setMessage("camera access was blocked — allow it in your browser settings.");
    }
  }

  function takeShot() {
    const video = videoRef.current;
    if (!video || !ready) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.94);
  }

  function startSession() {
    if (!ready || running) return;
    setPhotos([]);
    setShot(1);
    setRunning(true);
    runCountdown(1, []);
  }

  function runCountdown(shotNumber, currentPhotos) {
    let remaining = countdown;
    setTimer(remaining);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setTimer(null);
        const image = takeShot();
        if (!image) return;
        const nextPhotos = [...currentPhotos, image];
        setPhotos(nextPhotos);
        if (shotNumber < TOTAL_SHOTS) {
          setTimeout(() => {
            setShot(shotNumber + 1);
            runCountdown(shotNumber + 1, nextPhotos);
          }, 850);
        } else {
          setTimeout(() => {
            setRunning(false);
            setShot(TOTAL_SHOTS);
            onCapture(nextPhotos);
          }, 450);
        }
      } else setTimer(remaining);
    }, 1000);
  }

  function cancelAndReset() {
    clearInterval(intervalRef.current);
    setTimer(null);
    setRunning(false);
    setPhotos([]);
    setShot(0);
  }

  return (
    <section className="camera-section">
      <div className="camera-topline">
        <div><span className="live-dot" /> {message}</div>
        <div className="booth-meta">
          <span className="shot-counter">{shot ? `${Math.min(shot, TOTAL_SHOTS)} / ${TOTAL_SHOTS}` : "4-photo strip"}</span>
          <label>
            countdown
            <select value={countdown} onChange={(e) => setCountdown(Number(e.target.value))} disabled={running}>
              <option value="3">3 sec</option>
              <option value="5">5 sec</option>
              <option value="10">10 sec</option>
            </select>
          </label>
        </div>
      </div>
      <div className="camera-stage">
        <video ref={videoRef} autoPlay playsInline muted />
        <div className="camera-corner corner-a" />
        <div className="camera-corner corner-b" />
        <div className="camera-scribble">four little pics<br />one tiny memory ♡</div>
        {timer !== null && <div className="countdown">{timer}</div>}
        {running && timer === null && <div className="between-shot">next one…</div>}
        {!ready && <div className="camera-loading">allow camera access<br />to enter the booth</div>}
      </div>
      <div className="camera-controls">
        <div>
          <strong>{running ? `shot ${shot} of ${TOTAL_SHOTS}` : "classic four-shot booth"}</strong>
          <span>{running ? "hold that pose — it's almost time" : "the shutter rolls through all four automatically"}</span>
        </div>
        {!running ? (
          <button className="capture-button" onClick={startSession} disabled={!ready}>
            <span className="shutter" /> start the booth
          </button>
        ) : (
          <button className="secondary-button camera-reset" onClick={cancelAndReset}>cancel session</button>
        )}
      </div>
    </section>
  );
}
