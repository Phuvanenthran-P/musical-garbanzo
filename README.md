# Birthday Surprise

Plain HTML, CSS and JavaScript. No build step, no backend.

## Folder structure
```
birthday-surprise/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── birthday-song.mp4   <-- YOU add this file
│   └── favicon.png
└── README.md
```

## Personalize
Open `script.js`. The `CONFIG` block at the very top holds everything:
- `friendName` (set to Asif), `myName`
- `videoPath`

## Replace the video
Save your video as `assets/birthday-song.mp4` (or change `videoPath`).
Use H.264 video + AAC audio, ideally under ~50 MB, so it plays on phones.
If the file is missing, the page shows a friendly error instead.

## Test locally
Double-click `index.html`, or run `python3 -m http.server` in this folder and open http://localhost:8000.

## Deploy: GitHub Pages (free)
1. Create a new public GitHub repository.
2. Upload all the files, keeping the `assets` folder (GitHub's "Add file > Upload files").
3. Settings > Pages > Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`. Save.
4. After about a minute your link appears: `https://<username>.github.io/<repo>/`.
Note: GitHub rejects single files over 100 MB, so compress the video if needed.

## Deploy: Firebase Hosting (free)
1. `npm install -g firebase-tools` then `firebase login`
2. In this folder run `firebase init hosting`: public directory `.`, single-page app: No, overwrite index.html: No.
3. Add `"ignore": ["README.md", "firebase.json", "**/.*"]` is already the default; no other config is needed.
4. `firebase deploy`

## The unlock game
The site opens with a catch-the-gifts game. Change how many gifts are needed with `game: { goal: 10 }` in `script.js`.
A "Skip the game" button appears after 25 seconds so nobody gets stuck. Controls: drag/slide on touch or mouse, or arrow keys / A and D.

## Flow (no scrolling, everything works on click)
Game -> candles (blow them out) -> video -> when the video ends, the page finishes on a "Happy Birthday" end card with fireworks.
If the video file is missing, a Continue button appears so he is not stuck.
