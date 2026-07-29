const roundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function composePhoto({ source = [], frame = "bubblegum", stickers = [], caption = "", journal = false }) {
  const sources = Array.isArray(source) ? source : [source];
  const images = await Promise.all(sources.map(loadImage));
  return journal ? composeJournal(images, frame, stickers, caption) : composeStrip(images, frame, stickers, caption);
}

async function composeStrip(images, frame, stickers, caption) {
  const W = 760;
  const photoW = 600;
  const photoH = 410;
  const gap = 28;
  const top = 86;
  const bottom = 120;
  const H = top + images.length * photoH + (images.length - 1) * gap + bottom;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  drawPaperBackground(ctx, W, H, frame);

  const x = (W - photoW) / 2;
  images.forEach((img, index) => {
    const y = top + index * (photoH + gap);
    ctx.save();
    ctx.fillStyle = "#fffdf8";
    ctx.shadowColor = "rgba(40,30,25,.14)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(x - 7, y - 7, photoW + 14, photoH + 14);
    ctx.restore();
    drawImageCover(ctx, img, x, y, photoW, photoH);
  });

  drawFrameDecor(ctx, W, H, frame);
  drawStickers(ctx, stickers, W, H);

  if (caption) {
    ctx.fillStyle = frame === "noir" ? "#f6f1e7" : "#2c2722";
    ctx.font = "500 25px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(caption.slice(0, 48), W / 2, H - 45);
    ctx.textAlign = "left";
  }

  return canvas.toDataURL("image/jpeg", 0.94);
}

function composeJournal(images, frame, stickers, caption) {
  const W = 1500, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d8c4a8";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f2e8d8";
  ctx.fillRect(34, 34, W - 68, H - 68);

  // paper texture / notebook lines
  ctx.strokeStyle = "rgba(116,91,65,.13)";
  ctx.lineWidth = 2;
  for (let y = 110; y < H - 70; y += 52) {
    ctx.beginPath(); ctx.moveTo(760, y); ctx.lineTo(W - 90, y); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(170,77,86,.18)";
  ctx.beginPath(); ctx.moveTo(735, 75); ctx.lineTo(735, H - 70); ctx.stroke();

  ctx.fillStyle = "#3a3028";
  ctx.font = "700 28px DM Sans, sans-serif";
  ctx.fillText("PHOTObooth by HRI", 85, 85);
  ctx.font = "italic 21px Georgia, serif";
  ctx.fillStyle = "#866c55";
  ctx.fillText("a little page worth keeping", 790, 95);

  // strip pinned to paper
  const stripW = 490, stripH = 760;
  const stripX = 145, stripY = 180;
  ctx.save();
  ctx.translate(stripX + stripW / 2, stripY + stripH / 2);
  ctx.rotate(-0.035);
  ctx.fillStyle = "#fffdf8";
  ctx.shadowColor = "rgba(45,35,25,.2)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 16;
  ctx.fillRect(-stripW / 2, -stripH / 2, stripW, stripH);
  ctx.restore();
  ctx.save();
  ctx.translate(stripX + stripW / 2, stripY + stripH / 2);
  ctx.rotate(-0.035);
  const innerW = 390, innerH = 505;
  const sx = -innerW / 2, sy = -stripH / 2 + 78;
  const each = Math.floor((innerH - 24 * 3) / 4);
  images.forEach((img, i) => drawImageCover(ctx, img, sx, sy + i * (each + 24), innerW, each));
  ctx.fillStyle = "#3a3028";
  ctx.font = "700 17px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PHOTObooth by HRI", 0, stripH / 2 - 35);
  ctx.restore();

  // paper pin + tape
  ctx.fillStyle = "#b67c67";
  ctx.beginPath(); ctx.arc(stripX + stripW / 2, stripY - 7, 25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(245,218,163,.75)";
  ctx.save(); ctx.translate(stripX + stripW / 2 - 10, stripY - 30); ctx.rotate(-0.06); ctx.fillRect(0, 0, 125, 45); ctx.restore();

  ctx.fillStyle = "#5e4a3a";
  ctx.font = "italic 48px Georgia, serif";
  wrapText(ctx, caption || "a tiny page from a very cute day ♡", 810, 280, 530, 72, 5);
  ctx.font = "20px DM Sans, sans-serif";
  ctx.fillStyle = "#927861";
  ctx.fillText(new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }), 810, 740);
  ctx.font = "18px DM Sans, sans-serif";
  ctx.fillText("four little photos · one very good memory", 810, 785);
  drawStickers(ctx, stickers, W, H, true);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function drawImageCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function drawPaperBackground(ctx, W, H, frame) {
  const bg = {
    bubblegum: "#f7d8df", zebra: "#f3eee5", leopard: "#d4a76c", cherry: "#fff2df",
    gingham: "#cfe5ed", chrome: "#d8dce0", butter: "#f4e3a4", noir: "#272522"
  }[frame] || "#f7d8df";
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  if (frame === "bubblegum") {
    ctx.fillStyle = "#c95b76";
    for (let x = 18; x < W; x += 62) for (let y = 18; y < H; y += 62) { ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
  }
  if (frame === "zebra") {
    ctx.save(); ctx.globalAlpha = .95; ctx.strokeStyle = "#211f1d"; ctx.lineWidth = 34;
    for (let i = -H; i < W + H; i += 110) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.quadraticCurveTo(i + 50, H * .22, i - 10, H * .48); ctx.quadraticCurveTo(i - 65, H * .72, i + 25, H); ctx.stroke(); }
    ctx.restore();
  }
  if (frame === "leopard") drawLeopard(ctx, W, H);
  if (frame === "cherry") drawCherryBorder(ctx, W, H);
  if (frame === "gingham") {
    ctx.fillStyle = "rgba(255,255,255,.38)";
    for (let x = 0; x < W; x += 54) ctx.fillRect(x, 0, 27, H);
    for (let y = 0; y < H; y += 54) ctx.fillRect(0, y, W, 27);
  }
  if (frame === "chrome") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#f8f9fa"); grad.addColorStop(.22, "#a8adb4"); grad.addColorStop(.43, "#ffffff"); grad.addColorStop(.68, "#9da3aa"); grad.addColorStop(1, "#f4f5f6");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  }
  if (frame === "butter") {
    ctx.fillStyle = "rgba(255,255,255,.4)";
    for (let x = 0; x < W; x += 90) for (let y = 0; y < H; y += 90) { ctx.beginPath(); ctx.arc(x + 45, y + 45, 17, 0, Math.PI * 2); ctx.fill(); }
  }
  if (frame === "noir") {
    ctx.strokeStyle = "#f1e8d7"; ctx.lineWidth = 5; ctx.strokeRect(22, 22, W - 44, H - 44);
  }
}

function drawFrameDecor(ctx, W, H, frame) {
  const ink = frame === "noir" ? "#f5eddf" : "#302a25";
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.font = "700 19px DM Sans, sans-serif";
  const labels = { bubblegum: "HRI'S LITTLE PHOTO CLUB", zebra: "NO RULES · JUST POSES", leopard: "AFTER DARK · BY HRI", cherry: "CHERRY MEMORY CLUB", gingham: "A VERY CUTE DAY", chrome: "FLASH ON · FEEL GOOD", butter: "SWEET LITTLE MOMENTS", noir: "PHOTObooth by HRI" };
  ctx.fillText(labels[frame] || "PHOTObooth by HRI", W / 2, 42);
  ctx.font = "500 14px DM Sans, sans-serif";
  ctx.fillText("04 / 04", W / 2, H - 23);
  ctx.textAlign = "left";

  if (frame === "cherry") {
    ctx.fillStyle = "#b82f46";
    [[45, 42], [W - 45, 42], [45, H - 42], [W - 45, H - 42]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); });
  }
  if (frame === "chrome") {
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 3; ctx.strokeRect(16, 16, W - 32, H - 32);
  }
  if (frame === "butter") {
    ctx.fillStyle = "#705a2c"; ctx.font = "italic 25px Georgia, serif"; ctx.fillText("xoxo", 28, H - 24);
  }
}

function drawLeopard(ctx, W, H) {
  ctx.fillStyle = "#b98245";
  const spots = [[70,90,25,16],[W-70,115,30,20],[55,260,22,30],[W-55,360,27,18],[70,H-95,29,19],[W-80,H-160,22,31],[W/2-30,35,18,10],[W/2+40,H-38,25,12]];
  spots.forEach(([x,y,rx,ry], i) => { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,(i%3)*.4,0,Math.PI*2); ctx.fill(); ctx.strokeStyle="#38271b"; ctx.lineWidth=5; ctx.stroke(); });
}

function drawCherryBorder(ctx, W, H) {
  ctx.strokeStyle = "#b72e45"; ctx.lineWidth = 16; ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.fillStyle = "#b72e45";
  for (let x = 35; x < W; x += 86) { ctx.beginPath(); ctx.arc(x, 62, 8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + 14, 53, 8, 0, Math.PI * 2); ctx.fill(); }
}

function drawStickers(ctx, stickers, W, H, journal = false) {
  const positions = journal
    ? [[1110, 180], [1310, 900], [1000, 870], [1370, 260], [900, 150], [1280, 550]]
    : [[75, 150], [W - 75, 250], [70, H - 170], [W - 70, H - 210], [W / 2 - 280, 45], [W / 2 + 260, H - 48]];
  const stickerFont = '56px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.font = stickerFont;
  stickers.slice(0, 6).forEach((sticker, index) => ctx.fillText(sticker, positions[index][0], positions[index][1]));
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(/\s+/);
  let line = ""; const lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}
