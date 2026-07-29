export async function saveToCreatorGallery(dataUrl, meta = {}) {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("photo", blob, `hri-${Date.now()}.jpg`);
  form.append("meta", JSON.stringify(meta));
  const res = await fetch("/api/gallery", { method: "POST", body: form });
  if (!res.ok) throw new Error("Could not save the photo.");
  return res.json();
}

export async function fetchCreatorGallery(password) {
  const res = await fetch("/api/gallery", {
    headers: { "x-admin-password": password }
  });
  if (!res.ok) throw new Error("Wrong password or gallery unavailable.");
  return res.json();
}

export async function deleteCreatorPhoto(id, password) {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "DELETE",
    headers: { "x-admin-password": password }
  });
  if (!res.ok) throw new Error("Could not delete photo.");
  return res.json();
}
