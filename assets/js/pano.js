/* ==========================================================================
   SWISSTEK PANORAMA VIEWER
   Artslab Creatives

   A small equirectangular 360 viewer built directly on three.js rather than
   on an off-the-shelf tour plugin, for three reasons:
     1. the chrome has to be ours, white and precise, not a plugin's defaults
     2. hotspots are DOM elements projected from 3D, so they stay crisp and
        fully styleable and keyboard reachable
     3. crossfading between viewpoints needs control of two spheres at once

   Public API:
     const v = new Pano(canvas, { onReady, onMove });
     v.load(scene)              scene = { img, yaw, pitch, hotspots:[...] }
     v.goTo(scene)              crossfades
     v.addHotspots(el, list, cb)
   ========================================================================== */

(function (global) {
  'use strict';

  var T = global.THREE;

  var DEG = Math.PI / 180;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function shortAngle(a, b) {          // shortest signed delta between angles
    var d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }

  function Pano(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.opts = opts;

    /* FOV was 74, which framed every space as a close-up of a shelf rather than
       a room you are standing in. 92 shows floor, ceiling and context, which is
       what makes it read as a showroom instead of a product photo. */
    /* Default sits mid-range so there is real headroom BOTH ways. At 92 with a
       104 ceiling there were only 12 degrees of zoom-out against 54 of zoom-in,
       which is why it felt permanently cramped. */
    var FOV = opts.fov || 84;
    this.yaw = 0; this.pitch = 0; this.fov = FOV;
    this.tYaw = 0; this.tPitch = 0; this.tFov = FOV;
    this.vYaw = 0; this.vPitch = 0;        // inertia
    this.dragging = false;
    this.idle = 0;
    this.autoRotate = opts.autoRotate !== false;
    this.hotspots = [];
    this.enabled = true;

    this.renderer = new T.WebGLRenderer({
      canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.NoToneMapping;

    this.scene = new T.Scene();
    this.scene.background = new T.Color('#F5F7F8');
    this.camera = new T.PerspectiveCamera(this.fov, 1, 0.1, 100);
    this.baseFov = FOV;

    // two spheres so a viewpoint change can crossfade
    var geo = new T.SphereGeometry(10, 128, 80);
    geo.scale(-1, 1, 1);                                  // render from inside
    this.matA = new T.MeshBasicMaterial({ transparent: true, opacity: 1 });
    this.matB = new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    this.sphA = new T.Mesh(geo, this.matA);
    this.sphB = new T.Mesh(geo.clone(), this.matB);
    this.sphB.renderOrder = 1;
    this.scene.add(this.sphA, this.sphB);

    this.loader = new T.TextureLoader();
    this._cache = {};

    this._bind();
    this._resize();
    global.addEventListener('resize', this._resize.bind(this));

    var self = this;
    this.renderer.setAnimationLoop(function () { self._tick(); });
  }

  /* ------------------------------------------------------------- input -- */

  Pano.prototype._bind = function () {
    var self = this, c = this.canvas;
    var px = 0, py = 0, moved = 0;

    function down(e) {
      if (!self.enabled) return;
      self.dragging = true; moved = 0;
      self.idle = 0;
      px = (e.touches ? e.touches[0].clientX : e.clientX);
      py = (e.touches ? e.touches[0].clientY : e.clientY);
      c.style.cursor = 'grabbing';
    }
    function move(e) {
      if (!self.dragging || !self.enabled) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var y = (e.touches ? e.touches[0].clientY : e.clientY);
      var dx = x - px, dy = y - py;
      px = x; py = y;
      moved += Math.abs(dx) + Math.abs(dy);
      var k = self.fov / 900;                      // zoomed in drags slower
      self.tYaw -= dx * k;
      self.tPitch = clamp(self.tPitch - dy * k, -78, 78);
      self.vYaw = -dx * k; self.vPitch = -dy * k;
      self.idle = 0;
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      self.dragging = false; c.style.cursor = 'grab';
    }

    c.addEventListener('mousedown', down);
    global.addEventListener('mousemove', move, { passive: false });
    global.addEventListener('mouseup', up);
    c.addEventListener('touchstart', down, { passive: true });
    global.addEventListener('touchmove', move, { passive: false });
    global.addEventListener('touchend', up);

    c.addEventListener('wheel', function (e) {
      if (!self.enabled) return;
      e.preventDefault();
      self.tFov = clamp(self.tFov + (e.deltaY > 0 ? 6 : -6), 30, 122);
      self.idle = 0;
    }, { passive: false });

    c.style.cursor = 'grab';
    c.setAttribute('tabindex', '0');
    c.addEventListener('keydown', function (e) {
      var step = 5;
      if (e.key === 'ArrowLeft')  { self.tYaw -= step; self.idle = 0; }
      if (e.key === 'ArrowRight') { self.tYaw += step; self.idle = 0; }
      if (e.key === 'ArrowUp')    { self.tPitch = clamp(self.tPitch + step, -78, 78); self.idle = 0; }
      if (e.key === 'ArrowDown')  { self.tPitch = clamp(self.tPitch - step, -78, 78); self.idle = 0; }
      if (e.key === '+' || e.key === '=') { self.tFov = clamp(self.tFov - 6, 30, 122); }
      if (e.key === '-')                  { self.tFov = clamp(self.tFov + 6, 30, 122); }
    });
  };

  Pano.prototype._resize = function () {
    var w = this.canvas.clientWidth || global.innerWidth;
    var h = this.canvas.clientHeight || global.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  /* ------------------------------------------------------------ loading -- */

  /* Textures are loaded through a bare Image with NO crossOrigin attribute.
     three's TextureLoader sets crossOrigin='anonymous', which makes Chrome
     refuse file:// images and leaves the sphere black when the demo is opened
     by double-clicking. Panorama sources are inlined as data: URLs by the
     build for the same reason, so nothing here is ever cross-origin. */
  Pano.prototype._tex = function (src, cb) {
    var self = this;
    var url = (global.PANO_DATA && global.PANO_DATA[src]) || src;
    if (this._cache[src]) { cb(this._cache[src]); return; }
    var img = new Image();
    img.onload = function () {
      var tx = new T.Texture(img);
      tx.colorSpace = T.SRGBColorSpace;
      tx.minFilter = T.LinearMipmapLinearFilter;
      tx.magFilter = T.LinearFilter;
      tx.generateMipmaps = true;
      tx.anisotropy = Math.min(8, self.renderer.capabilities.getMaxAnisotropy());
      tx.wrapS = T.RepeatWrapping;
      tx.needsUpdate = true;
      self._cache[src] = tx;
      cb(tx);
    };
    img.onerror = function () {
      if (global.console) console.warn('Pano: could not load', src);
    };
    img.src = url;
  };

  Pano.prototype.load = function (scene, cb) {
    var self = this;
    this._tex(scene.img, function (tx) {
      self.matA.map = tx; self.matA.opacity = 1; self.matA.needsUpdate = true;
      self.matB.opacity = 0;
      if (scene.yaw !== undefined)   { self.yaw = self.tYaw = scene.yaw; }
      if (scene.pitch !== undefined) { self.pitch = self.tPitch = scene.pitch; }
      self.current = scene;
      if (cb) cb();
      if (self.opts.onReady) self.opts.onReady(scene);
    });
  };

  /* Crossfade to a new viewpoint. Also nudges yaw toward the new scene's
     entry angle so arriving somewhere feels like walking, not teleporting. */
  Pano.prototype.goTo = function (scene, cb) {
    var self = this;
    if (this._fading) return;
    this._tex(scene.img, function (tx) {
      self.matB.map = tx; self.matB.opacity = 0; self.matB.needsUpdate = true;
      self._fading = true;
      var t0 = null, DUR = 780;
      var yaw0 = self.tYaw;
      var yawTarget = scene.yaw !== undefined ? yaw0 + shortAngle(yaw0, scene.yaw) : yaw0;

      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = clamp((ts - t0) / DUR, 0, 1);
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        self.matB.opacity = e;
        self.tYaw = lerp(yaw0, yawTarget, e);
        if (scene.pitch !== undefined) self.tPitch = lerp(self.tPitch, scene.pitch, e * 0.25);
        if (p < 1) { requestAnimationFrame(step); return; }
        // settle: B becomes A
        self.matA.map = self.matB.map; self.matA.opacity = 1; self.matA.needsUpdate = true;
        self.matB.opacity = 0;
        /* Snap to the arrival angle. The camera eases toward tYaw at 0.12 per
           frame, so a large swing between spaces was still drifting seconds
           after the crossfade ended, and the markers for the new space were
           not yet in frame when you got there. */
        if (scene.yaw !== undefined)   { self.tYaw = yawTarget; self.yaw = yawTarget; }
        if (scene.pitch !== undefined) { self.tPitch = scene.pitch; self.pitch = scene.pitch; }
        self.vYaw = self.vPitch = 0;
        self._fading = false;
        self.current = scene;
        if (cb) cb();
        if (self.opts.onReady) self.opts.onReady(scene);
      }
      requestAnimationFrame(step);
    });
  };

  /* ---------------------------------------------------------- hotspots -- */

  /* list items: { yaw, pitch, kind, label, sub, data } */
  Pano.prototype.setHotspots = function (layer, list, onPick) {
    var self = this;
    layer.innerHTML = '';
    this.hotspots = (list || []).map(function (h) {
      var b = document.createElement('button');
      b.className = 'hs hs--' + (h.kind || 'point');
      b.type = 'button';
      b.setAttribute('aria-label', h.label || 'Hotspot');
      var glyph;
      if (h.kind === 'nav') {
        glyph = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      } else if (h.kind === 'film') {
        /* A filled triangle, not a plus. The marker has to read as "this one
           plays" from across the room, before the label is legible. */
        glyph = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.6v12.8L19 12z"/></svg>';
      } else {
        glyph = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 5v14M5 12h14"/></svg>';
      }
      var inner = '<span class="hs__dot" aria-hidden="true">' + glyph + '</span>';
      if (h.label) {
        inner += '<span class="hs__lab"><span class="hs__t">' + h.label + '</span>' +
          (h.sub ? '<span class="hs__s">' + h.sub + '</span>' : '') + '</span>';
      }
      b.innerHTML = inner;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (onPick) onPick(h);
      });
      layer.appendChild(b);
      return { def: h, el: b, v: new T.Vector3() };
    });
    this._projectHotspots();
  };

  Pano.prototype._projectHotspots = function () {
    if (!this.hotspots.length) return;
    var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    var cam = this.camera;
    for (var i = 0; i < this.hotspots.length; i++) {
      var hs = this.hotspots[i], d = hs.def;
      var ph = (90 - d.pitch) * DEG, th = (d.yaw) * DEG;
      hs.v.set(
        -9 * Math.sin(ph) * Math.cos(th),
         9 * Math.cos(ph),
         9 * Math.sin(ph) * Math.sin(th)
      );
      var p = hs.v.clone().project(cam);
      var behind = p.z > 1;
      var x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h;
      var vis = !behind && x > -80 && x < w + 80 && y > -60 && y < h + 60;
      // A point behind the camera projects to a huge coordinate. Park it well
      // off-stage instead, so it cannot stretch the layer or the scrollable area.
      if (!vis) { x = -9999; y = -9999; }
      /* Direction 01 keeps its zone plates permanently open, so a marker on the
         right of the screen would push its label off the edge. Flip the plate to
         the left, and shift the whole box so the DOT stays on the point: row-
         reverse only reorders children, the box still grows rightward. */
      var flip = vis && x > w * 0.58;
      hs.el.classList.toggle('flip', flip);
      var px2 = x;
      if (flip) {
        var dw = (hs.el.firstElementChild && hs.el.firstElementChild.offsetWidth) || 46;
        px2 = x + dw - hs.el.offsetWidth;
      }
      hs.el.style.transform = 'translate3d(' + Math.round(px2) + 'px,' + Math.round(y) + 'px,0)';
      hs.el.style.opacity = vis ? '1' : '0';
      hs.el.style.pointerEvents = vis ? 'auto' : 'none';
    }
  };

  /* -------------------------------------------------------------- loop -- */

  Pano.prototype._tick = function () {
    // inertia after release
    if (!this.dragging) {
      if (Math.abs(this.vYaw) > 0.0015 || Math.abs(this.vPitch) > 0.0015) {
        this.tYaw += this.vYaw; this.vYaw *= 0.93;
        this.tPitch = clamp(this.tPitch + this.vPitch, -78, 78); this.vPitch *= 0.93;
      } else { this.vYaw = this.vPitch = 0; }

      this.idle += 1;
      if (this.autoRotate && this.idle > 340 && !this._fading) this.tYaw += 0.018;
    }

    this.yaw   = lerp(this.yaw,   this.tYaw,   0.12);
    this.pitch = lerp(this.pitch, this.tPitch, 0.12);
    if (Math.abs(this.fov - this.tFov) > 0.01) {
      this.fov = lerp(this.fov, this.tFov, 0.14);
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    var ph = (90 - this.pitch) * DEG, th = this.yaw * DEG;
    this.camera.lookAt(
      -Math.sin(ph) * Math.cos(th),
       Math.cos(ph),
       Math.sin(ph) * Math.sin(th)
    );

    this._projectHotspots();
    if (this.opts.onMove) this.opts.onMove(this.yaw, this.pitch, this.fov);
    this.renderer.render(this.scene, this.camera);
  };

  Pano.prototype.zoom = function (d) { this.tFov = clamp(this.tFov + d, 30, 122); this.idle = 0; };
  Pano.prototype.reset = function () {
    if (!this.current) return;
    this.tYaw = this.current.yaw || 0;
    this.tPitch = this.current.pitch || 0;
    this.tFov = this.baseFov; this.idle = 0;
  };

  global.Pano = Pano;
})(window);
