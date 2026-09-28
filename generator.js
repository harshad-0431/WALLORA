/**
 * Wallora Procedural 4K Wallpaper Engine
 * Generates 100% original, copyright-free high-resolution wallpapers directly in the browser canvas.
 */

class WallpaperGenerator {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    this.state = {
      preset: 'glow_mesh',
      color1: '#8b5cf6', // Violet
      color2: '#06b6d4', // Cyan
      color3: '#ec4899', // Pink
      colorBg: '#09090b', // Deep dark
      complexity: 6,
      glow: 60,
      noise: 15,
      aspectRatio: '9:16', // '9:16' | '16:9' | '1:1'
      seed: Math.random() * 1000
    };

    this.points = [];
    this.init();
  }

  init() {
    this.resizePreview();
    this.generatePoints();
    this.render();
  }

  resizePreview() {
    let width = 360;
    let height = 640;

    if (this.state.aspectRatio === '16:9') {
      width = 640;
      height = 360;
    } else if (this.state.aspectRatio === '1:1') {
      width = 480;
      height = 480;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }

  generatePoints() {
    this.points = [];
    const count = Math.max(4, this.state.complexity * 2);
    for (let i = 0; i < count; i++) {
      this.points.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: (Math.random() * 0.4 + 0.3) * Math.min(this.canvas.width, this.canvas.height),
        color: [this.state.color1, this.state.color2, this.state.color3][i % 3],
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5
      });
    }
  }

  setPreset(presetName) {
    this.state.preset = presetName;
    this.generatePoints();
    this.render();
  }

  updateColors(c1, c2, c3, bg) {
    if (c1) this.state.color1 = c1;
    if (c2) this.state.color2 = c2;
    if (c3) this.state.color3 = c3;
    if (bg) this.state.colorBg = bg;
    this.generatePoints();
    this.render();
  }

  setAspectRatio(ratio) {
    this.state.aspectRatio = ratio;
    this.resizePreview();
    this.generatePoints();
    this.render();
  }

  randomize() {
    const vibrantHues = [
      ['#6366f1', '#38bdf8', '#f43f5e', '#030712'],
      ['#8b5cf6', '#d946ef', '#06b6d4', '#09090b'],
      ['#10b981', '#06b6d4', '#3b82f6', '#022c22'],
      ['#f59e0b', '#ef4444', '#7c3aed', '#18181b'],
      ['#ec4899', '#8b5cf6', '#3b82f6', '#000000'],
      ['#14b8a6', '#f59e0b', '#ec4899', '#0f172a']
    ];
    const picked = vibrantHues[Math.floor(Math.random() * vibrantHues.length)];
    this.state.color1 = picked[0];
    this.state.color2 = picked[1];
    this.state.color3 = picked[2];
    this.state.colorBg = picked[3];
    this.state.seed = Math.random() * 10000;
    this.generatePoints();
    this.render();
  }

  render(targetCtx = this.ctx, width = this.canvas.width, height = this.canvas.height) {
    const ctx = targetCtx;
    ctx.save();
    
    // Fill Background
    ctx.fillStyle = this.state.colorBg;
    ctx.fillRect(0, 0, width, height);

    if (this.state.preset === 'glow_mesh') {
      this.renderGlowMesh(ctx, width, height);
    } else if (this.state.preset === 'aurora') {
      this.renderAurora(ctx, width, height);
    } else if (this.state.preset === 'cyber_grid') {
      this.renderCyberGrid(ctx, width, height);
    } else if (this.state.preset === 'starfield') {
      this.renderStarfield(ctx, width, height);
    } else if (this.state.preset === 'geometric') {
      this.renderGeometric(ctx, width, height);
    }

    // Add subtle cinematic vignette
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.8
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  renderGlowMesh(ctx, w, h) {
    const scale = w / this.canvas.width;
    const blurAmount = (this.state.glow / 100) * 80 * scale;

    this.points.forEach((p) => {
      const px = (p.x / this.canvas.width) * w;
      const py = (p.y / this.canvas.height) * h;
      const pr = p.radius * scale;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, pr);
      grad.addColorStop(0, p.color + 'dd');
      grad.addColorStop(0.5, p.color + '66');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtle fluid lighting overlay
    const overlayGrad = ctx.createLinearGradient(0, 0, w, h);
    overlayGrad.addColorStop(0, this.state.color1 + '33');
    overlayGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
    overlayGrad.addColorStop(1, this.state.color2 + '44');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, w, h);
  }

  renderAurora(ctx, w, h) {
    const waves = Math.floor(this.state.complexity * 1.5) + 3;
    const colors = [this.state.color1, this.state.color2, this.state.color3];

    for (let i = 0; i < waves; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h * 0.3 + (i * h * 0.1));
      
      for (let x = 0; x <= w; x += 20) {
        const freq = 0.003 + (i * 0.001);
        const y = h * 0.4 + Math.sin(x * freq + this.state.seed + i) * (h * 0.15) + (i * 40);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, h * 0.3, 0, h);
      const col = colors[i % colors.length];
      waveGrad.addColorStop(0, col + 'aa');
      waveGrad.addColorStop(0.6, col + '22');
      waveGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = waveGrad;
      ctx.fill();
    }
  }

  renderCyberGrid(ctx, w, h) {
    const horizon = h * 0.55;

    // Glowing Sun on horizon
    const sunGrad = ctx.createRadialGradient(w / 2, horizon, 10, w / 2, horizon, w * 0.35);
    sunGrad.addColorStop(0, this.state.color3);
    sunGrad.addColorStop(0.6, this.state.color1 + 'cc');
    sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w / 2, horizon, w * 0.35, Math.PI, 0, false);
    ctx.fill();

    // Perspective Ground Grid
    ctx.strokeStyle = this.state.color2 + '99';
    ctx.lineWidth = Math.max(1, w / 400);

    // Horizontal grid lines
    const gridRows = 16;
    for (let i = 1; i <= gridRows; i++) {
      const progress = Math.pow(i / gridRows, 2);
      const y = horizon + progress * (h - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Perspective lines from vanishing point
    const vanishingX = w / 2;
    const cols = 20;
    for (let j = -cols; j <= cols; j++) {
      const bottomX = vanishingX + (j * (w / 8));
      ctx.beginPath();
      ctx.moveTo(vanishingX, horizon);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }
  }

  renderStarfield(ctx, w, h) {
    // Nebula Cloud
    const nebulaGrad = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.6);
    nebulaGrad.addColorStop(0, this.state.color1 + '88');
    nebulaGrad.addColorStop(0.4, this.state.color2 + '44');
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    const starCount = Math.floor(180 * (w / 400));
    ctx.fillStyle = '#ffffff';
    
    // Seeded random stars
    let localSeed = this.state.seed;
    const seededRandom = () => {
      localSeed = (localSeed * 9301 + 49297) % 233280;
      return localSeed / 233280;
    };

    for (let s = 0; s < starCount; s++) {
      const sx = seededRandom() * w;
      const sy = seededRandom() * h;
      const sr = seededRandom() * 1.8;
      const opacity = seededRandom() * 0.8 + 0.2;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();

      // Occasional bright cross star
      if (s % 30 === 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - sr * 4, sy);
        ctx.lineTo(sx + sr * 4, sy);
        ctx.moveTo(sx, sy - sr * 4);
        ctx.lineTo(sx, sy + sr * 4);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  renderGeometric(ctx, w, h) {
    const rows = 6;
    const cols = 6;
    const cellW = w / cols;
    const cellH = h / rows;
    const colors = [this.state.color1, this.state.color2, this.state.color3, this.state.colorBg];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellW, y);
        ctx.lineTo(x + cellW, y + cellH);
        ctx.closePath();
        ctx.fillStyle = colors[(r + c) % colors.length] + 'cc';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellH);
        ctx.lineTo(x + cellW, y + cellH);
        ctx.closePath();
        ctx.fillStyle = colors[(r * 2 + c) % colors.length] + '88';
        ctx.fill();
      }
    }
  }

  export4K(resolutionMode = '4K') {
    let outW = 2160;
    let outH = 3840;

    if (this.state.aspectRatio === '16:9') {
      outW = 3840;
      outH = 2160;
    } else if (this.state.aspectRatio === '1:1') {
      outW = 2560;
      outH = 2560;
    }

    if (resolutionMode === 'FHD') {
      outW = this.state.aspectRatio === '16:9' ? 1920 : 1080;
      outH = this.state.aspectRatio === '16:9' ? 1080 : 1920;
    }

    const offCanvas = document.createElement('canvas');
    offCanvas.width = outW;
    offCanvas.height = outH;
    const offCtx = offCanvas.getContext('2d');

    this.render(offCtx, outW, outH);

    // Create Download Link
    const link = document.createElement('a');
    link.download = `wallora_studio_${this.state.preset}_${outW}x${outH}_${Date.now()}.png`;
    link.href = offCanvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.WallpaperGenerator = WallpaperGenerator;
