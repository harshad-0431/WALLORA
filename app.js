/**
 * Wallora Main Application Logic
 * Mobile-first, responsive wallpaper engine, mockup previewer, and PWA controller.
 */

class WalloraApp {
  constructor() {
    this.currentView = 'explore';
    this.selectedCategory = 'all';
    this.selectedColor = 'all';
    this.searchQuery = '';
    this.activeWallpaper = null;
    this.favorites = this.loadFavorites();
    this.generator = null;
    this.deferredInstallPrompt = null;

    this.init();
  }

  init() {
    this.initTheme();
    this.registerServiceWorker();
    this.renderHeroSpotlight();
    this.renderDailySpotlight();
    this.renderCategoryChips();
    this.renderColorDots();
    this.renderWallpapers();
    this.initGenerator();
    this.setupEventListeners();
    this.startMockClock();
  }

  // -------------------------------------------------------------
  // Theme Management
  // -------------------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem('wallora_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtons(savedTheme);
  }

  setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('wallora_theme', themeName);
    this.updateThemeButtons(themeName);
    this.showToast(`Theme switched to ${themeName.toUpperCase()}`);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'oled' : (current === 'oled' ? 'light' : 'dark');
    this.setTheme(nextTheme);
  }

  updateThemeButtons(activeTheme) {
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-theme') === activeTheme);
    });
  }

  // -------------------------------------------------------------
  // Navigation & View Routing
  // -------------------------------------------------------------
  switchView(viewName) {
    this.currentView = viewName;

    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Update Sections
    document.querySelectorAll('.view-container').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

    if (viewName === 'favorites') {
      this.renderFavorites();
    } else if (viewName === 'studio' && this.generator) {
      this.generator.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -------------------------------------------------------------
  // Render Components
  // -------------------------------------------------------------
  renderHeroSpotlight() {
    const featured = WALLPAPER_CATALOG.find(w => w.isFeatured) || WALLPAPER_CATALOG[0];
    const heroImg = document.getElementById('hero-img');
    const heroTitle = document.getElementById('hero-title');
    const heroAuthor = document.getElementById('hero-author');
    const heroCard = document.getElementById('hero-spotlight-card');

    if (heroImg && heroTitle && heroAuthor && heroCard) {
      heroImg.src = featured.thumb;
      heroTitle.textContent = featured.title;
      heroAuthor.textContent = `${featured.author} • ${featured.license}`;
      heroCard.onclick = () => this.openDetailModal(featured);
    }
  }

  renderDailySpotlight() {
    const daily = WALLPAPER_CATALOG.find(w => w.isDaily) || WALLPAPER_CATALOG[0];
    const dailyImg = document.getElementById('daily-hero-img');
    const dailyTitle = document.getElementById('daily-hero-title');
    const dailyDesc = document.getElementById('daily-hero-desc');
    const previewBtn = document.getElementById('daily-preview-btn');
    const downloadBtn = document.getElementById('daily-download-btn');

    if (dailyImg && dailyTitle && dailyDesc) {
      dailyImg.src = daily.src;
      dailyTitle.textContent = daily.title;
      dailyDesc.textContent = daily.description;

      if (previewBtn) {
        previewBtn.onclick = () => this.openDetailModal(daily);
      }
      if (downloadBtn) {
        downloadBtn.onclick = () => this.downloadWallpaper(daily, '4K');
      }
    }
  }

  renderCategoryChips() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    const categoryCounts = {};
    WALLPAPER_CATALOG.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

    container.innerHTML = CATEGORIES.map(cat => {
      const count = cat.id === 'all' ? WALLPAPER_CATALOG.length : (categoryCounts[cat.id] || 0);
      return `
        <button class="chip-btn ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          ${cat.label} <span style="opacity: 0.75; font-size: 0.75em; margin-left: 2px;">(${count})</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.getAttribute('data-cat');
        this.renderCategoryChips();
        this.renderWallpapers();
      });
    });
  }

  renderColorDots() {
    const container = document.getElementById('color-filters-container');
    if (!container) return;

    container.innerHTML = COLOR_PALETTES.map(col => `
      <div class="color-dot ${this.selectedColor === col.hex ? 'active' : ''}"
           title="${col.name}"
           data-color="${col.hex}"
           style="background: ${col.hex === 'all' ? 'linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4)' : col.hex};">
      </div>
    `).join('');

    container.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.selectedColor = dot.getAttribute('data-color');
        this.renderColorDots();
        this.renderWallpapers();
      });
    });
  }

  getFilteredWallpapers() {
    return WALLPAPER_CATALOG.filter(item => {
      // Category Filter
      if (this.selectedCategory !== 'all' && item.category !== this.selectedCategory) {
        return false;
      }
      // Color Filter
      if (this.selectedColor !== 'all' && !item.palette.includes(this.selectedColor)) {
        return false;
      }
      // Search Query
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAuthor = item.author.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAuthor && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }

  renderWallpapers() {
    const grid = document.getElementById('wallpaper-grid');
    if (!grid) return;

    const items = this.getFilteredWallpapers();

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h4>No wallpapers found matching your filters</h4>
          <p style="font-size: 0.85rem; margin-top: 4px;">Try searching for "cosmic", "amoled", or clearing active color chips.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => this.createWallpaperCardHTML(item)).join('');
    this.attachCardEventListeners(grid);
  }

  createWallpaperCardHTML(item) {
    const isLiked = this.favorites.some(f => f.id === item.id);
    return `
      <div class="wallpaper-card ${item.orientation === 'landscape' ? 'landscape' : ''}" data-id="${item.id}">
        <img class="card-image" src="${item.thumb}" alt="${item.title}" loading="lazy">
        <div class="card-overlay">
          <div class="card-top-tags">
            <span class="badge-res">${item.resolution.includes('3840') ? '4K UHD' : 'QHD+'}</span>
            <button class="card-like-btn ${isLiked ? 'liked' : ''}" data-like-id="${item.id}" title="Bookmark">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>
          <div class="card-bottom-info">
            <div class="card-title">${item.title}</div>
            <div class="card-author">${item.author}</div>
          </div>
        </div>
      </div>
    `;
  }

  attachCardEventListeners(container) {
    container.querySelectorAll('.wallpaper-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-like-btn')) return;
        const id = card.getAttribute('data-id');
        const item = WALLPAPER_CATALOG.find(w => w.id === id);
        if (item) this.openDetailModal(item);
      });
    });

    container.querySelectorAll('.card-like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-like-id');
        this.toggleFavorite(id);
      });
    });
  }

  // -------------------------------------------------------------
  // Favorites / Bookmarks
  // -------------------------------------------------------------
  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('wallora_favorites') || '[]');
    } catch {
      return [];
    }
  }

  saveFavorites() {
    localStorage.setItem('wallora_favorites', JSON.stringify(this.favorites));
  }

  toggleFavorite(id) {
    const item = WALLPAPER_CATALOG.find(w => w.id === id);
    if (!item) return;

    const index = this.favorites.findIndex(f => f.id === id);
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.showToast(`Removed from saved collection`);
    } else {
      this.favorites.push(item);
      this.showToast(`Saved to offline collection ❤️`);
    }

    this.saveFavorites();
    this.renderWallpapers();
    if (this.currentView === 'favorites') {
      this.renderFavorites();
    }
    this.updateModalFavoriteButton();
  }

  renderFavorites() {
    const grid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('favorites-empty-state');
    if (!grid || !emptyState) return;

    if (this.favorites.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = this.favorites.map(item => this.createWallpaperCardHTML(item)).join('');
    this.attachCardEventListeners(grid);
  }

  // -------------------------------------------------------------
  // Modal & Mockup Preview Mode
  // -------------------------------------------------------------
  openDetailModal(wallpaper) {
    this.activeWallpaper = wallpaper;
    const modal = document.getElementById('detail-modal');
    const img = document.getElementById('modal-mockup-img');
    const title = document.getElementById('modal-title');
    const author = document.getElementById('modal-author');
    const license = document.getElementById('modal-license');
    const paletteRow = document.getElementById('modal-palette-row');
    const frame = document.getElementById('modal-mockup-frame');

    if (modal && img && title && author && license && paletteRow) {
      img.src = wallpaper.src;
      title.textContent = wallpaper.title;
      author.textContent = `By ${wallpaper.author}`;
      license.textContent = wallpaper.license;

      if (wallpaper.orientation === 'landscape') {
        frame.classList.add('landscape');
      } else {
        frame.classList.remove('landscape');
      }

      // Render Palette
      paletteRow.innerHTML = wallpaper.palette.map(hex => `
        <div class="palette-swatch" style="background: ${hex};" title="Copy ${hex}" onclick="app.copyHex('${hex}')"></div>
      `).join('');

      this.setMockupMode('lock');
      this.updateModalFavoriteButton();

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  setMockupMode(mode) {
    const lockOverlay = document.getElementById('modal-lockscreen-overlay');
    const homeOverlay = document.getElementById('modal-homescreen-overlay');
    const btnLock = document.getElementById('btn-mode-lock');
    const btnHome = document.getElementById('btn-mode-home');
    const btnClean = document.getElementById('btn-mode-clean');

    btnLock.classList.toggle('active', mode === 'lock');
    btnHome.classList.toggle('active', mode === 'home');
    btnClean.classList.toggle('active', mode === 'clean');

    if (mode === 'lock') {
      lockOverlay.classList.add('active');
      homeOverlay.classList.remove('active');
    } else if (mode === 'home') {
      lockOverlay.classList.remove('active');
      homeOverlay.classList.add('active');
    } else {
      lockOverlay.classList.remove('active');
      homeOverlay.classList.remove('active');
    }
  }

  updateModalFavoriteButton() {
    const btn = document.getElementById('btn-modal-favorite');
    if (!btn || !this.activeWallpaper) return;
    const isLiked = this.favorites.some(f => f.id === this.activeWallpaper.id);
    btn.textContent = isLiked ? '💔 Remove from Bookmarks' : '❤️ Save to Bookmarks';
  }

  copyHex(hex) {
    navigator.clipboard.writeText(hex).then(() => {
      this.showToast(`Copied ${hex} to clipboard!`);
    }).catch(() => {
      this.showToast(`Hex: ${hex}`);
    });
  }

  startMockClock() {
    const clockEl = document.getElementById('lock-clock-display');
    const dateEl = document.getElementById('lock-date-display');
    
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      if (clockEl) clockEl.textContent = `${hours}:${mins}`;
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  // -------------------------------------------------------------
  // High-Resolution Downloader
  // -------------------------------------------------------------
  downloadWallpaper(wallpaper, resolutionLabel = '4K') {
    this.showToast(`Preparing ${resolutionLabel} high-resolution download...`);

    // Fetch and trigger download
    fetch(wallpaper.src)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const cleanName = wallpaper.title.toLowerCase().replace(/\s+/g, '_');
        a.download = `wallora_${cleanName}_${resolutionLabel}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.showToast(`Download started! Enjoy your wallpaper.`);
      })
      .catch(() => {
        // Fallback direct open
        window.open(wallpaper.src, '_blank');
        this.showToast(`Opened high-res image in new tab.`);
      });
  }

  // -------------------------------------------------------------
  // Procedural Studio Generator
  // -------------------------------------------------------------
  initGenerator() {
    const canvas = document.getElementById('generator-canvas');
    if (!canvas) return;

    this.generator = new WallpaperGenerator(canvas);

    // Preset Buttons
    document.querySelectorAll('#preset-buttons-container .preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#preset-buttons-container .preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.generator.setPreset(btn.getAttribute('data-preset'));
      });
    });

    // Color Pickers
    const c1 = document.getElementById('studio-color1');
    const c2 = document.getElementById('studio-color2');
    const c3 = document.getElementById('studio-color3');
    const bg = document.getElementById('studio-bg');

    const updateStudioColors = () => {
      this.generator.updateColors(c1.value, c2.value, c3.value, bg.value);
    };

    if (c1 && c2 && c3 && bg) {
      c1.addEventListener('input', updateStudioColors);
      c2.addEventListener('input', updateStudioColors);
      c3.addEventListener('input', updateStudioColors);
      bg.addEventListener('input', updateStudioColors);
    }

    // Aspect Ratio Switcher
    document.querySelectorAll('[data-ratio]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-ratio]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const ratio = btn.getAttribute('data-ratio');
        const wrapper = document.getElementById('canvas-wrapper');
        if (wrapper) {
          wrapper.className = `canvas-wrapper ${ratio === '16:9' ? 'landscape' : (ratio === '1:1' ? 'square' : '')}`;
        }
        this.generator.setAspectRatio(ratio);
      });
    });

    // Complexity & Glow sliders
    const compSlider = document.getElementById('studio-complexity');
    const glowSlider = document.getElementById('studio-glow');

    if (compSlider) {
      compSlider.addEventListener('input', (e) => {
        this.generator.state.complexity = parseInt(e.target.value);
        document.getElementById('val-complexity').textContent = e.target.value;
        this.generator.generatePoints();
        this.generator.render();
      });
    }

    if (glowSlider) {
      glowSlider.addEventListener('input', (e) => {
        this.generator.state.glow = parseInt(e.target.value);
        document.getElementById('val-glow').textContent = `${e.target.value}%`;
        this.generator.render();
      });
    }

    // Studio Action buttons
    const randBtn = document.getElementById('studio-randomize-btn');
    const exportBtn = document.getElementById('studio-export-4k-btn');

    if (randBtn) {
      randBtn.addEventListener('click', () => {
        this.generator.randomize();
        c1.value = this.generator.state.color1;
        c2.value = this.generator.state.color2;
        c3.value = this.generator.state.color3;
        bg.value = this.generator.state.colorBg;
        this.showToast('Generated fresh procedural palette!');
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.generator.export4K('4K');
        this.showToast('Exported true 4K wallpaper to your downloads!');
      });
    }
  }

  // -------------------------------------------------------------
  // Event Listeners & PWA Setup
  // -------------------------------------------------------------
  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Search Input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderWallpapers();
      });
    }

    // Theme Switchers
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.getAttribute('data-set-theme'));
      });
    });

    // Support Banner Close (Dismissal persisted)
    const banner = document.getElementById('support-banner');
    const closeBanner = document.getElementById('close-support-banner');
    if (banner && closeBanner) {
      if (localStorage.getItem('wallora_support_banner_dismissed') === 'true') {
        banner.style.display = 'none';
      }
      closeBanner.addEventListener('click', () => {
        banner.style.display = 'none';
        localStorage.setItem('wallora_support_banner_dismissed', 'true');
        this.showToast('Banner dismissed. Wallora remains completely free!');
      });
    }

    // Modal Mockup Mode Switchers
    document.getElementById('btn-mode-lock')?.addEventListener('click', () => this.setMockupMode('lock'));
    document.getElementById('btn-mode-home')?.addEventListener('click', () => this.setMockupMode('home'));
    document.getElementById('btn-mode-clean')?.addEventListener('click', () => this.setMockupMode('clean'));

    // Modal Close
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeDetailModal());
    document.getElementById('detail-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal') this.closeDetailModal();
    });

    // Modal Download buttons
    document.getElementById('btn-download-4k')?.addEventListener('click', () => {
      if (this.activeWallpaper) this.downloadWallpaper(this.activeWallpaper, '4K');
    });
    document.getElementById('btn-download-qhd')?.addEventListener('click', () => {
      if (this.activeWallpaper) this.downloadWallpaper(this.activeWallpaper, 'QHD');
    });
    document.getElementById('btn-download-fhd')?.addEventListener('click', () => {
      if (this.activeWallpaper) this.downloadWallpaper(this.activeWallpaper, 'FHD');
    });
    document.getElementById('btn-modal-favorite')?.addEventListener('click', () => {
      if (this.activeWallpaper) this.toggleFavorite(this.activeWallpaper.id);
    });

    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) installBtn.style.display = 'flex';
    });

    const triggerInstall = () => {
      if (this.deferredInstallPrompt) {
        this.deferredInstallPrompt.prompt();
        this.deferredInstallPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            this.showToast('Thank you for installing Wallora!');
          }
          this.deferredInstallPrompt = null;
        });
      } else {
        this.showToast('To install: tap Share/Menu > "Add to Home Screen"');
      }
    };

    document.getElementById('install-pwa-btn')?.addEventListener('click', triggerInstall);
    document.getElementById('install-pwa-btn-settings')?.addEventListener('click', triggerInstall);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(() => console.log('Wallora PWA ServiceWorker active'))
          .catch((err) => console.log('SW registration note:', err));
      });
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WalloraApp();
});
