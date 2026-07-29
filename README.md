# Photobooth by Hri

A playful web photobooth inspired by the *idea* of browser photobooths, but with an original visual direction: editorial scrapbook + polka dots + animal print + cherry details.

## Included

- Browser camera permission flow
- 3 / 5 / 10 second countdown
- Retake button
- Trendy frame picker: Pink Polka, Zebra, Leopard, Cherry Pop, Double Line
- Sticker picker
- Optional caption
- Download to the visitor's own device
- Optional, explicit consent to send a copy to Hri's creator gallery
- Password-protected creator/admin gallery
- Delete shared photos from the admin panel
- Scrapbook/journal mode with a photo pinned to the paper and editable handwritten-style note
- Responsive mobile layout

## Run it locally

Requirements: Node.js 18+.

1. Open this folder in Terminal.
2. Run:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Change `ADMIN_PASSWORD` to a password you choose.
5. Run:

```bash
npm run dev
```

6. Open `http://localhost:5173`.

The Vite frontend runs on port 5173 and proxies `/api` to the gallery server on port 5050.

## Admin gallery

Click **Hri's gallery** or **creator login**.

The default `.env.example` password is intentionally a placeholder. Change it before using the admin panel.

Shared photos are stored in `server/uploads` and their metadata is stored in `server/data/gallery.json`.

## Privacy behavior

The creator-gallery switch is OFF by default. The visitor can still download their own edited photo without uploading it to the server.

The camera is used in-browser with `getUserMedia`. Camera permissions are controlled by the browser.

For a real public launch, replace the simple demo password/filesystem gallery with proper authentication, encrypted storage, HTTPS, a privacy policy, and a managed database/object-storage system.

## Production build

```bash
npm run build
npm run server
```

The Express server will serve the Vite `dist` folder and the gallery API.

## Design direction

The site intentionally does not copy MySketchBooth's text, branding, artwork, or exact layout. It uses the reference only as inspiration for the concept of a browser-based photobooth.

To customize the visual identity, start in `src/styles.css` and change the CSS variables at the top.

## Important deployment note

Browser camera access normally requires HTTPS when deployed publicly (localhost is allowed for local development). Use a hosting setup that provides HTTPS.

Also, never put your admin password directly in React code. Keep it in the server environment.
