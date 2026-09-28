# Wallora — Architecture & Feature Specification

## 1. Overview & Brand Identity
**Wallora** is a modern, responsive Progressive Web App (PWA) designed for discovering, previewing, generating, and downloading high-resolution, legally compliant wallpapers.

### Key Principles (Adherence to Project Rules):
- **Original & Licensed Assets**: Every wallpaper in the catalog includes clear licensing tags (Unsplash License, CC0, or Wallora Studio Generative Original).
- **Original UI/UX**: Custom glassmorphism aesthetic, interactive phone/desktop screen preview overlays (interactive clock, widgets, app icon overlays), and an in-app procedural 4K Wallpaper Studio.
- **User-Centric Monetization**: Zero popups, zero intrusive interstitials. Non-blocking "Support Wallora" ethical tip-jar / banner that can be dismissed or disabled anytime without restricting features.
- **PWA & Offline Ready**: Service Worker caching, offline catalog browsing, and installable as a native mobile/desktop app.

---

## 2. Information Architecture & Navigation
1. **Explore (Home)**:
   - Spotlight Hero / Daily Wallpaper
   - Category Pills (Minimalist, AMOLED, Cosmic, Cyberpunk, Nature, Anime, 3D Render, Gradients)
   - Color Filter Palette & Orientation Filter (Portrait, Landscape, Square)
   - Search bar with instant autocomplete tags
   - Responsive Masonry Grid with lazy loading, tags, like buttons, and quick actions
2. **Daily Spotlight**:
   - Curated Wallpaper of the Day with story, color breakdown, and one-click set/download
3. **Wallora Studio (Interactive 4K Generator)**:
   - Procedural Wallpaper Engine (Glow Mesh, Neon Waves, Deep Space Aurora, Geometric Prisms, Minimalist Gradients)
   - Real-time parameter controls (Colors, Density, Speed, Seed, Blur)
   - One-click Render to 4K / QHD / FHD Portrait & Landscape
4. **Favorites & History**:
   - Saved collection with offline persistence (LocalStorage)
   - Download history & quick batch export
5. **Settings & About**:
   - Theme toggle (OLED Dark, Midnight Slate, Clean Light)
   - Grid density preference (Compact / Comfortable)
   - Ethical monetization toggle ("Support Wallora" banner state)
   - License & Attribution registry

---

## 3. Interactive Detail & Mockup Preview Mode
- **Lock Screen Simulator**: Renders realistic iOS/Android time, date, battery, flashlight/camera toggles over the wallpaper to see how lock screens look.
- **Home Screen Simulator**: Renders realistic app grid icons and search bar overlay.
- **Desktop Simulator**: Renders laptop bezel and taskbar overlay for 16:9 wallpapers.
- **Multi-Resolution Downloader**: 4K UHD (3840x2160 / 2160x3840), QHD (1440x2560), FHD (1080x1920), or Custom Resolution.
- **Color Palette Analyzer**: Extracts dominant hex colors with one-click copy.
