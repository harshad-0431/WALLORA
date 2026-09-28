# Wallora — Ultra HD Wallpaper Web App & 4K Studio

**Wallora** is a high-performance, responsive Progressive Web App (PWA) built with vanilla HTML5, CSS3, and JavaScript with zero build dependencies, 100% compatible with static hosting on **GitHub Pages**.

---

## 🚀 GitHub Pages Deployment Guide

### Why the site appeared unstyled previously
When hosting a project repository on GitHub Pages at `https://<username>.github.io/<repo-name>/`:
1. The `css/`, `js/`, and `icons/` folders must be committed alongside `index.html`.
2. All paths must be relative (e.g., `./css/styles.css` and `./js/app.js` instead of absolute root `/style.css`).
3. An empty `.nojekyll` file must exist in the root to prevent GitHub Pages from ignoring assets or subfolders.

---

### How to push all fixes to GitHub in 1 step

Run this command in your terminal from the project root:

```bash
git push -u origin main --force
```

Once pushed, GitHub Pages will automatically rebuild and your site at:
**`https://harshad-0431.github.io/wallora/`**
will render with full CSS styling, animations, all 104 high-resolution wallpapers, interactive live mockup previewers, and the procedural 4K Wallpaper Studio.

---

## ✨ Features & Capabilities

- **104 Genuinely Unique Curated Wallpapers**: Strict licensing (Unsplash Free License, CC0 Public Domain, Wallora Originals).
- **Responsive Layout**: 2 columns on mobile, 3 on large mobile, 4 on tablet, 5 on desktop — zero blank gaps.
- **Interactive Mockup Mode**: Real-time Lock Screen (with live digital clock & date) and Home Screen app dock simulation.
- **Wallora Studio 4K**: In-browser procedural canvas engine for generating custom 4K wallpapers.
- **Offline Persistence**: Bookmarks and theme settings saved in `localStorage`.
- **PWA Ready**: Offline caching via `sw.js` and installable to home screen via `manifest.json`.
