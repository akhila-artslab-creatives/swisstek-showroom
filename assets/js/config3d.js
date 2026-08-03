/* ==========================================================================
   SWISSTEK REAL-TIME 3D  (Direction 03)

   FOUR rooms, not one, and built for realism rather than the earlier abstract
   grey massing:

   - Image-based lighting from a generated interior through PMREMGenerator.
   - A real plaster map on the walls and a real garden plate behind the glazing,
     which is the single biggest realism win available: an empty white rectangle
     where a window should be is what made the old room read as a mockup.
   - Furniture built from grouped, proportioned solids with fabric, timber and
     metal roughness values rather than one flat grey.
   - Soft contact shadows under every object. Real-time shadow maps alone leave
     furniture looking like it is hovering.

   Calibration carried forward from the original prototype, do not undo:
   texture repeat is per axis so tiles stay square in a non-square room, and
   defaults are 30cm tiles with a 6mm joint, because at 60/3 a grout change is
   physically accurate and visually invisible.
   ========================================================================== */

(function () {
  'use strict';
  var T = window.THREE;

  var state = {
    room: 'living',
    system: 'tile',
    tile:  SW.tileFinishes[0],
    grout: SW.groutShades.filter(function (g) { return g.code === '020'; })[0],
    wood:  SW.timbers[0],
    wall:  SW.wallFinishes[1],
    tileSize: 30,
    joint: 6,
    wetArea: true
  };

  /* ------------------------------------------------ procedural materials -- */

  function shade(hex, amt) {
    var c = new T.Color(hex), hsl = {};
    c.getHSL(hsl);
    c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
    return '#' + c.getHexString();
  }

  function tileCanvas(o, size) {
    size = size || 1024;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var g = cv.getContext('2d');
    g.fillStyle = o.groutHex; g.fillRect(0, 0, size, size);
    var cell = size / o.n;
    for (var y = 0; y < o.n; y++) for (var x = 0; x < o.n; x++) {
      var x0 = x * cell + o.j / 2, y0 = y * cell + o.j / 2, w = cell - o.j;
      var v = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      g.fillStyle = shade(o.tileHex, (v - 0.5) * 0.035);
      g.fillRect(x0, y0, w, w);
      if (o.veins) {
        g.save(); g.beginPath(); g.rect(x0, y0, w, w); g.clip();
        g.strokeStyle = shade(o.tileHex, -0.16); g.lineWidth = Math.max(1, cell * 0.006);
        for (var k = 0; k < 4; k++) {
          var vy = y0 + ((v * 37 + k * 23) % 1) * w;
          g.globalAlpha = 0.10 + ((v * 11 + k) % 1) * 0.14;
          g.beginPath(); g.moveTo(x0, vy);
          for (var xx = 0; xx <= w; xx += 24)
            g.lineTo(x0 + xx, vy + Math.sin(xx * 0.02 + k + v * 6) * w * 0.045);
          g.stroke();
        }
        g.restore(); g.globalAlpha = 1;
      }
      g.strokeStyle = shade(o.tileHex, -0.07);          // edge shading
      g.lineWidth = Math.max(1, cell * 0.012);
      g.strokeRect(x0 + 1, y0 + 1, w - 2, w - 2);
    }
    var img = g.getImageData(0, 0, size, size), d = img.data;
    for (var i = 0; i < d.length; i += 16) {
      var n = (Math.random() - 0.5) * 9;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  function roughCanvas(o, size) {
    size = size || 1024;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var g = cv.getContext('2d'), j = o.j * (size / 1024), cell = size / o.n;
    g.fillStyle = '#E8E8E8'; g.fillRect(0, 0, size, size);
    g.fillStyle = '#2A2A2A';
    for (var y = 0; y < o.n; y++) for (var x = 0; x < o.n; x++)
      g.fillRect(x * cell + j / 2, y * cell + j / 2, cell - j, cell - j);
    return cv;
  }

  function bumpCanvas(o, size) {
    size = size || 1024;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var g = cv.getContext('2d'), j = o.j * (size / 1024), cell = size / o.n;
    g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
    g.fillStyle = '#fff';
    for (var y = 0; y < o.n; y++) for (var x = 0; x < o.n; x++)
      g.fillRect(x * cell + j / 2, y * cell + j / 2, cell - j, cell - j);
    return cv;
  }

  function woodCanvas(hex, size) {
    size = size || 1024;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var g = cv.getContext('2d'), planks = 6, ph = size / planks;
    for (var i = 0; i < planks; i++) {
      var off = (i % 2) ? size * 0.37 : 0;
      g.fillStyle = shade(hex, ((i * 0.37) % 1 - 0.5) * 0.06);
      g.fillRect(0, i * ph, size, ph);
      g.strokeStyle = shade(hex, -0.10); g.lineWidth = 1;
      for (var k = 0; k < 26; k++) {
        var y = i * ph + (k / 26) * ph + Math.random() * 2;
        g.globalAlpha = 0.13 + Math.random() * 0.16;
        g.beginPath(); g.moveTo(0, y);
        for (var x = 0; x <= size; x += 48)
          g.lineTo(x, y + Math.sin((x + off) * 0.011 + i) * 2.2);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = shade(hex, -0.30);
      g.fillRect(0, i * ph, size, 2);
      g.fillRect(off, i * ph, 2, ph);
    }
    return cv;
  }

  /* A blurred garden seen through glazing. Layered soft masses rather than
     detail, because that is how foliage reads at depth of field through a
     window, and it never looks like a flat colour. */
  function gardenCanvas() {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 640;
    var g = cv.getContext('2d');
    var sky = g.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, '#CBE2F2'); sky.addColorStop(0.42, '#E8F1F4');
    sky.addColorStop(0.56, '#DCE6D8'); sky.addColorStop(1, '#B9C6A8');
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 640);
    // distant boundary wall
    g.fillStyle = '#E6E7E2'; g.fillRect(0, 330, 1024, 78);
    function mass(cx, cy, rx, ry, col, alpha) {
      g.save(); g.globalAlpha = alpha; g.fillStyle = col;
      g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    var greens = ['#7E9A66', '#6B8A57', '#8CA974', '#5E7C4C', '#9AB183'];
    for (var i = 0; i < 46; i++) {
      var x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 1024;
      var y = 300 + ((Math.sin(i * 78.233) * 43758.5453 % 1 + 1) % 1) * 300;
      var r = 40 + ((Math.sin(i * 3.77) * 43758.5453 % 1 + 1) % 1) * 120;
      mass(x, y, r, r * 0.66, greens[i % greens.length], 0.5 + (i % 4) * 0.1);
    }
    for (var k = 0; k < 5; k++) {                     // palm trunks
      var tx = 90 + k * 215;
      g.globalAlpha = 0.5; g.fillStyle = '#8A8069';
      g.fillRect(tx, 150, 13, 240);
      for (var f = 0; f < 7; f++) {
        var a = -Math.PI / 2 + (f - 3) * 0.42;
        g.save(); g.translate(tx + 6, 158); g.rotate(a);
        g.globalAlpha = 0.55; g.fillStyle = '#6E8F58';
        g.beginPath(); g.ellipse(78, 0, 84, 15, 0, 0, Math.PI * 2); g.fill(); g.restore();
      }
    }
    g.globalAlpha = 1;
    // heavy blur pass, so it reads as depth of field not as shapes
    if (g.filter !== undefined) {
      var tmp = document.createElement('canvas'); tmp.width = 1024; tmp.height = 640;
      var t2 = tmp.getContext('2d'); t2.filter = 'blur(9px)'; t2.drawImage(cv, 0, 0);
      return tmp;
    }
    return cv;
  }

  /* soft radial blob used as a contact shadow under furniture */
  function blobCanvas() {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256;
    var g = cv.getContext('2d');
    var r = g.createRadialGradient(128, 128, 4, 128, 128, 126);
    r.addColorStop(0, 'rgba(0,0,0,0.46)');
    r.addColorStop(0.45, 'rgba(0,0,0,0.20)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return cv;
  }

  function tex(canvas, rx, ry) {
    var t = new T.CanvasTexture(canvas);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx, ry === undefined ? rx : ry);
    t.anisotropy = 16;
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  /* ----------------------------------------------------------------- boot -- */

  function boot() {
    var canvas = document.getElementById('view');
    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.outputColorSpace = T.SRGBColorSpace;

    var scene = new T.Scene();
    scene.background = new T.Color('#EDF1F3');

    var camera = new T.PerspectiveCamera(60, 1, 0.1, 200);
    var controls = new window.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.075;
    controls.minDistance = 0.7; controls.maxDistance = 9;   // keeps you inside
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    /* --------------------------------------------------------- textures -- */

    var TD = window.TEX_DATA || {};
    function imgTex(key, rx, ry, srgb) {
      var t = new T.Texture();
      var im = new Image();
      im.onload = function () { t.image = im; t.needsUpdate = true; };
      im.src = TD[key] || '';
      t.wrapS = t.wrapT = T.MirroredRepeatWrapping;   // mirrored hides any seam
      t.repeat.set(rx, ry === undefined ? rx : ry);
      t.anisotropy = 8;
      if (srgb !== false) t.colorSpace = T.SRGBColorSpace;
      return t;
    }
    var plaster = TD.plaster ? imgTex('plaster', 3, 2) : null;
    var blobTex = new T.CanvasTexture(blobCanvas());

    /* image-based lighting */
    var pmrem = new T.PMREMGenerator(renderer);
    (function () {
      /* Served over http the equirect loads as an ordinary file. The data
         URL bundle only exists for the file:// build, where Chrome refuses
         to upload a file:// image to the GPU. */
      var url = (window.PANO_DATA && window.PANO_DATA['../assets/pano/env.webp']) ||
                '../assets/pano/env.webp';
      var img = new Image();
      img.onload = function () {
        var t = new T.Texture(img);
        t.mapping = T.EquirectangularReflectionMapping;
        t.colorSpace = T.SRGBColorSpace; t.needsUpdate = true;
        scene.environment = pmrem.fromEquirectangular(t).texture;
        t.dispose();
      };
      img.src = url;
    })();

    var sun = new T.DirectionalLight('#FFF4E4', 1.35);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
    sun.shadow.camera.far = 48; sun.shadow.bias = -0.0007; sun.shadow.radius = 3;
    scene.add(sun);
    scene.add(new T.HemisphereLight('#EAF1F7', '#9AA0A4', 0.3));

    /* -------------------------------------------------------- materials -- */

    var M = {
      floor: new T.MeshStandardMaterial({ roughness: 0.5, envMapIntensity: 0.9 }),
      wall:  new T.MeshStandardMaterial({ roughness: 0.94, envMapIntensity: 0.45,
                                          side: T.DoubleSide }),
      feat:  new T.MeshStandardMaterial({ roughness: 0.4,  envMapIntensity: 0.95,
                                          side: T.DoubleSide }),
      ceil:  new T.MeshStandardMaterial({ color: '#F6F8F9', roughness: 0.97,
                                          side: T.DoubleSide }),
      trim:  new T.MeshStandardMaterial({ color: '#F4F6F7', roughness: 0.5, envMapIntensity: .7 }),
      fabric:new T.MeshStandardMaterial({ color: '#E4E1DA', roughness: 0.94, envMapIntensity: .3 }),
      fabricD:new T.MeshStandardMaterial({ color: '#C9CCCE', roughness: 0.92, envMapIntensity: .3 }),
      timber:new T.MeshStandardMaterial({ color: '#9C6B3E', roughness: 0.55, envMapIntensity: .6 }),
      metal: new T.MeshStandardMaterial({ color: '#2E3234', roughness: 0.34, metalness: 0.82,
                                          envMapIntensity: 1.0 }),
      chrome:new T.MeshStandardMaterial({ color: '#D8DDE0', roughness: 0.12, metalness: 0.95,
                                          envMapIntensity: 1.0 }),
      glassM:new T.MeshStandardMaterial({ color: '#EAF2F7', roughness: 0.05, metalness: 0,
                                          transparent: true, opacity: 0.24, envMapIntensity: 1 }),
      green: new T.MeshStandardMaterial({ color: '#4C6B45', roughness: 0.82 }),
      pot:   new T.MeshStandardMaterial({ color: '#B9B3A8', roughness: 0.8 }),
      stone: new T.MeshStandardMaterial({ color: '#E7E9EA', roughness: 0.35, envMapIntensity: .9 })
    };
    if (plaster) { M.wall.map = plaster; M.wall.color.set('#FFFFFF'); }

    function contact(x, z, w, d, y) {
      var m = new T.Mesh(new T.PlaneGeometry(w, d),
        new T.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false,
                                  opacity: 0.85 }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, (y || 0) + 0.006, z);
      m.renderOrder = 2; return m;
    }
    function box(w, h, d, x, y, z, mat, g) {
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
      (g || scene).add(m); return m;
    }
    function cyl(r1, r2, h, x, y, z, mat, g) {
      var m = new T.Mesh(new T.CylinderGeometry(r1, r2, h, 24), mat);
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
      (g || scene).add(m); return m;
    }

    /* ------------------------------------------------------------ rooms -- */
    /* Every room is a group. Only one is visible at a time, and all of them
       share the floor / wall / feature materials so a material change applies
       everywhere at once. */

    var ROOMS = {};
    var current = null;

    function shell(g, R, opts) {
      opts = opts || {};
      var floor = new T.Mesh(new T.PlaneGeometry(R.w, R.d), M.floor);
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);

      var ceil = new T.Mesh(new T.PlaneGeometry(R.w, R.d), M.ceil);
      ceil.rotation.x = Math.PI / 2; ceil.position.y = R.h; g.add(ceil);

      // recessed cove: a slim bright strip just below the ceiling line
      var cove = new T.Mesh(new T.BoxGeometry(R.w - 0.5, 0.05, R.d - 0.5),
        new T.MeshStandardMaterial({ color: '#fff', emissive: '#FFF6E8',
                                     emissiveIntensity: 0.7, roughness: 1 }));
      cove.position.set(0, R.h - 0.09, 0); g.add(cove);

      var back = new T.Mesh(new T.PlaneGeometry(R.w, R.h), opts.featBack ? M.feat : M.wall);
      back.position.set(0, R.h / 2, -R.d / 2); back.receiveShadow = true; g.add(back);
      var left = new T.Mesh(new T.PlaneGeometry(R.d, R.h), M.wall);
      left.rotation.y = Math.PI / 2; left.position.set(-R.w / 2, R.h / 2, 0);
      left.receiveShadow = true; g.add(left);
      var right = new T.Mesh(new T.PlaneGeometry(R.d, R.h), M.wall);
      right.rotation.y = -Math.PI / 2; right.position.set(R.w / 2, R.h / 2, 0);
      right.receiveShadow = true; g.add(right);

      // skirting
      [[R.w, 0, -R.d / 2 + 0.012, 0], [R.d, -R.w / 2 + 0.012, 0, Math.PI / 2],
       [R.d, R.w / 2 - 0.012, 0, -Math.PI / 2]].forEach(function (s) {
        var m = new T.Mesh(new T.BoxGeometry(s[0], 0.11, 0.022), M.trim);
        m.position.set(s[1], 0.055, s[2]); m.rotation.y = s[3];
        m.castShadow = true; g.add(m);
      });
      return g;
    }

    /* a glazed opening with a real garden plate behind it */
    function glazing(g, R, wide) {
      var W = wide || R.d * 0.66, H = R.h * 0.66, x = -R.w / 2;
      var yc = H / 2 + 0.42;
      /* An empty rectangle where a window should be is what made the old room
         read as a mockup. There is always something outside now: a real garden
         plate if one shipped, otherwise a soft out-of-focus garden painted on a
         canvas, which is what you actually perceive through glazing anyway. */
      var plate = new T.Mesh(new T.PlaneGeometry(W * 2.8, H * 2.2),
        new T.MeshBasicMaterial({ map: TD.garden ? imgTex('garden', 1, 1)
                                                 : new T.CanvasTexture(gardenCanvas()) }));
      plate.rotation.y = Math.PI / 2;
      plate.position.set(x - 2.8, yc + 0.35, 0);
      g.add(plate);
      // mullions
      var fm = M.metal;
      var frame = new T.Group(); g.add(frame);
      [[0.05, H + .1, .05, x + .05, yc, -W / 2], [0.05, H + .1, .05, x + .05, yc, W / 2],
       [0.05, H + .1, .05, x + .05, yc, 0]].forEach(function (b) {
        box(b[0], b[1], b[2], b[3], b[4], b[5], fm, frame);
      });
      box(0.05, 0.06, W, x + .05, yc + H / 2, 0, fm, frame);
      box(0.05, 0.06, W, x + .05, yc - H / 2, 0, fm, frame);
      var gl = new T.Mesh(new T.PlaneGeometry(W, H), M.glassM);
      gl.rotation.y = Math.PI / 2; gl.position.set(x + 0.06, yc, 0); g.add(gl);
      // light coming in
      var win = new T.RectAreaLight ? null : null;
      var fill = new T.DirectionalLight('#EAF4FF', 0.5);
      fill.position.set(x - 6, yc + 2, 0); fill.target.position.set(0, 1, 0);
      g.add(fill); g.add(fill.target);
    }

    function plant(g, x, z, s) {
      s = s || 1;
      cyl(0.19 * s, 0.15 * s, 0.34 * s, x, 0.17 * s, z, M.pot, g);
      for (var i = 0; i < 7; i++) {
        var a = i / 7 * Math.PI * 2;
        var b = new T.Mesh(new T.BoxGeometry(0.03 * s, 0.62 * s, 0.17 * s), M.green);
        b.position.set(x + Math.cos(a) * 0.1 * s, 0.62 * s, z + Math.sin(a) * 0.1 * s);
        b.rotation.set(Math.cos(a) * 0.32, -a, Math.sin(a) * 0.32);
        b.castShadow = true; g.add(b);
      }
      g.add(contact(x, z, 0.9 * s, 0.9 * s));
    }

    function pendant(g, x, z, y) {
      cyl(0.008, 0.008, y, x, y / 2 + 0.9, z, M.metal, g);
      var sh = new T.Mesh(new T.CylinderGeometry(0.19, 0.13, 0.16, 28), M.trim);
      sh.position.set(x, 0.9, z); g.add(sh);
      var bulb = new T.Mesh(new T.SphereGeometry(0.07, 16, 12),
        new T.MeshStandardMaterial({ color: '#fff', emissive: '#FFEBC8', emissiveIntensity: 2.2 }));
      bulb.position.set(x, 0.83, z); g.add(bulb);
      var pl = new T.PointLight('#FFE9C4', 0.5, 6, 2); pl.position.set(x, 0.85, z); g.add(pl);
    }

    /* --- LIVING ------------------------------------------------------- */
    ROOMS.living = (function () {
      var R = { w: 9.2, d: 6.6, h: 3.3 }, g = new T.Group(); g.userData.R = R;
      shell(g, R, { featBack: true }); glazing(g, R, 4.4);
      // sofa
      var sx = -1.3, sz = 1.5;
      box(2.9, 0.34, 1.02, sx, 0.24, sz, M.fabric, g);
      box(2.9, 0.52, 0.24, sx, 0.62, sz - 0.44, M.fabric, g);
      box(0.24, 0.42, 1.02, sx - 1.33, 0.55, sz, M.fabric, g);
      box(0.24, 0.42, 1.02, sx + 1.33, 0.55, sz, M.fabric, g);
      [-0.72, 0, 0.72].forEach(function (o) {
        box(0.66, 0.14, 0.62, sx + o, 0.48, sz + 0.06, M.fabricD, g);
      });
      [[-1.3, 0.42], [1.3, 0.42], [-1.3, -0.42], [1.3, -0.42]].forEach(function (p) {
        cyl(0.028, 0.028, 0.14, sx + p[0], 0.07, sz + p[1], M.metal, g);
      });
      g.add(contact(sx, sz, 4.1, 2.1));
      // rug
      var rug = new T.Mesh(new T.PlaneGeometry(4.2, 2.9),
        new T.MeshStandardMaterial({ color: '#DCD8D0', roughness: 1 }));
      rug.rotation.x = -Math.PI / 2; rug.position.set(sx + 0.2, 0.008, sz - 1.5);
      rug.receiveShadow = true; g.add(rug);
      // coffee table
      box(1.5, 0.055, 0.72, sx + 0.2, 0.36, sz - 1.35, M.timber, g);
      [[-0.66, -0.3], [0.66, -0.3], [-0.66, 0.3], [0.66, 0.3]].forEach(function (p) {
        cyl(0.022, 0.022, 0.34, sx + 0.2 + p[0], 0.17, sz - 1.35 + p[1], M.metal, g);
      });
      g.add(contact(sx + 0.2, sz - 1.35, 2.1, 1.3));
      // sideboard against the back wall
      box(2.6, 0.62, 0.44, 2.3, 0.44, -R.d / 2 + 0.28, M.timber, g);
      box(2.66, 0.03, 0.47, 2.3, 0.76, -R.d / 2 + 0.28, M.trim, g);
      g.add(contact(2.3, -R.d / 2 + 0.4, 3.4, 1.2));
      // art
      var art = new T.Mesh(new T.PlaneGeometry(1.5, 1.05),
        new T.MeshStandardMaterial({ color: '#E9E5DD', roughness: .9 }));
      art.position.set(2.3, 1.85, -R.d / 2 + 0.03); g.add(art);
      box(1.56, 1.11, 0.03, 2.3, 1.85, -R.d / 2 + 0.015, M.trim, g);
      plant(g, R.w / 2 - 1.0, -R.d / 2 + 0.9, 1.25);
      pendant(g, sx + 0.2, sz - 1.35, 1.5);
      return g;
    })();

    /* --- BATHROOM ----------------------------------------------------- */
    ROOMS.bathroom = (function () {
      var R = { w: 5.2, d: 4.4, h: 3.0 }, g = new T.Group(); g.userData.R = R;
      shell(g, R, { featBack: true }); glazing(g, R, 2.0);
      // vanity
      box(2.3, 0.5, 0.56, 0.9, 0.62, -R.d / 2 + 0.32, M.timber, g);
      box(2.4, 0.05, 0.6, 0.9, 0.89, -R.d / 2 + 0.32, M.stone, g);
      box(0.62, 0.11, 0.4, 0.9, 0.95, -R.d / 2 + 0.3, M.stone, g);
      cyl(0.018, 0.018, 0.28, 0.9, 1.06, -R.d / 2 + 0.52, M.chrome, g);
      var mir = new T.Mesh(new T.PlaneGeometry(2.0, 1.15),
        new T.MeshStandardMaterial({ color: '#DDE6EB', roughness: 0.04, metalness: 0.6,
                                     envMapIntensity: 1.2 }));
      mir.position.set(0.9, 1.85, -R.d / 2 + 0.03); g.add(mir);
      g.add(contact(0.9, -R.d / 2 + 0.45, 3.0, 1.2));
      // shower enclosure, glass
      var gx = -R.w / 2 + 1.35;
      var sg = new T.Mesh(new T.PlaneGeometry(2.1, 2.2), M.glassM);
      sg.position.set(gx + 1.05, 1.1, 0.55); g.add(sg);
      var sg2 = new T.Mesh(new T.PlaneGeometry(2.2, 2.2), M.glassM);
      sg2.rotation.y = Math.PI / 2; sg2.position.set(gx + 2.1, 1.1, -0.55); g.add(sg2);
      box(0.04, 2.2, 0.04, gx + 2.1, 1.1, 0.55, M.chrome, g);
      cyl(0.02, 0.02, 0.5, gx + 0.5, 2.1, -1.2, M.chrome, g);
      var head = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 0.03, 22), M.chrome);
      head.position.set(gx + 0.5, 1.86, -1.2); g.add(head);
      // linear drain
      box(0.9, 0.01, 0.06, gx + 0.6, 0.012, 0.2, M.chrome, g);
      // towel rail + bench
      box(0.5, 0.42, 1.1, R.w / 2 - 0.45, 0.21, 1.1, M.timber, g);
      g.add(contact(R.w / 2 - 0.45, 1.1, 1.2, 1.8));
      plant(g, R.w / 2 - 0.7, -R.d / 2 + 0.7, 0.85);
      return g;
    })();

    /* --- KITCHEN ------------------------------------------------------ */
    ROOMS.kitchen = (function () {
      var R = { w: 7.4, d: 5.6, h: 3.1 }, g = new T.Group(); g.userData.R = R;
      shell(g, R, { featBack: true }); glazing(g, R, 3.0);
      // run of units along the back
      box(5.4, 0.86, 0.62, 0.6, 0.43, -R.d / 2 + 0.33, M.trim, g);
      box(5.5, 0.05, 0.66, 0.6, 0.885, -R.d / 2 + 0.33, M.stone, g);
      for (var i = 0; i < 6; i++)
        box(0.02, 0.74, 0.01, 0.6 - 2.45 + i * 0.9, 0.44, -R.d / 2 + 0.645, M.metal, g);
      // splashback in the feature material
      var sb = new T.Mesh(new T.PlaneGeometry(5.4, 0.62), M.feat);
      sb.position.set(0.6, 1.22, -R.d / 2 + 0.02); g.add(sb);
      // wall cabinets
      box(2.4, 0.72, 0.36, -0.9, 1.92, -R.d / 2 + 0.2, M.trim, g);
      // island
      box(3.1, 0.88, 1.15, 0.4, 0.44, 1.0, M.timber, g);
      box(3.25, 0.06, 1.3, 0.4, 0.91, 1.0, M.stone, g);
      g.add(contact(0.4, 1.0, 4.3, 2.3));
      cyl(0.02, 0.02, 0.3, -0.3, 1.08, 0.75, M.chrome, g);
      // stools
      [-0.5, 0.5, 1.5].forEach(function (o) {
        cyl(0.17, 0.17, 0.05, 0.4 + o * 0.85, 0.66, 2.0, M.timber, g);
        cyl(0.03, 0.03, 0.64, 0.4 + o * 0.85, 0.32, 2.0, M.metal, g);
        g.add(contact(0.4 + o * 0.85, 2.0, 0.6, 0.6));
      });
      pendant(g, -0.3, 1.0, 1.35); pendant(g, 0.4, 1.0, 1.35); pendant(g, 1.1, 1.0, 1.35);
      plant(g, R.w / 2 - 0.8, -R.d / 2 + 0.8, 1.0);
      return g;
    })();

    /* --- TERRACE ------------------------------------------------------ */
    ROOMS.terrace = (function () {
      var R = { w: 10, d: 7.5, h: 3.4 }, g = new T.Group(); g.userData.R = R;
      var floor = new T.Mesh(new T.PlaneGeometry(R.w, R.d), M.floor);
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
      // house wall behind, in the wall finish
      var back = new T.Mesh(new T.PlaneGeometry(R.w, R.h), M.wall);
      back.position.set(0, R.h / 2, -R.d / 2); back.receiveShadow = true; g.add(back);
      var featPanel = new T.Mesh(new T.PlaneGeometry(4.2, R.h * 0.82), M.feat);
      featPanel.position.set(-2.6, R.h * 0.41, -R.d / 2 + 0.02); g.add(featPanel);
      // pergola: posts and rafters, gives strong shadow patterning
      for (var px = -3.6; px <= 3.6; px += 3.6)
        for (var pz = -1.4; pz <= 2.6; pz += 4.0)
          cyl(0.07, 0.07, R.h, px, R.h / 2, pz, M.metal, g);
      for (var rz = -1.6; rz <= 2.8; rz += 0.42)
        box(7.6, 0.09, 0.05, 0, R.h - 0.1, rz, M.timber, g);
      // lounge seating
      box(2.4, 0.3, 0.9, -2.4, 0.21, 0.9, M.fabricD, g);
      box(2.4, 0.44, 0.2, -2.4, 0.55, 0.5, M.fabricD, g);
      g.add(contact(-2.4, 0.9, 3.4, 1.9));
      box(1.0, 0.05, 0.6, -2.4, 0.4, 2.0, M.timber, g);
      // planting bed with pebbles
      box(3.0, 0.24, 1.3, 3.0, 0.12, 1.6, M.trim, g);
      var peb = new T.Mesh(new T.PlaneGeometry(2.8, 1.15),
        new T.MeshStandardMaterial({ color: '#CFCBC4', roughness: 1 }));
      peb.rotation.x = -Math.PI / 2; peb.position.set(3.0, 0.245, 1.6); g.add(peb);
      plant(g, 2.3, 1.6, 1.2); plant(g, 3.7, 1.6, 0.95);
      plant(g, -R.w / 2 + 0.9, -R.d / 2 + 1.0, 1.4);
      // low boundary wall
      box(R.w, 0.55, 0.2, 0, 0.28, R.d / 2, M.trim, g);
      scene.background = new T.Color('#EDF1F3');
      return g;
    })();

    Object.keys(ROOMS).forEach(function (k) { ROOMS[k].visible = false; scene.add(ROOMS[k]); });

    /* ------------------------------------------------------------ views -- */

    /* Cameras sit INSIDE each room at roughly eye height. Positioning them
       outside the shell showed the room as a cutaway dollhouse with the ceiling
       as a floating slab, which is the opposite of standing in a space. */
    var VIEWS = {
      living:   { room:[3.1,1.62,2.3, -1.4,1.15,-1.7], floor:[1.0,1.15,1.4, -0.4,0.04,-0.4], wet:[1.6,1.6,1.4, -0.4,1.5,-3.2] },
      bathroom: { room:[1.65,1.58,1.5, -1.0,1.12,-1.5], floor:[0.7,1.05,0.8, -0.2,0.03,-0.3], wet:[1.2,1.55,1.1, -1.5,1.4,-1.4] },
      kitchen:  { room:[2.5,1.62,1.9, -0.9,1.12,-1.8], floor:[0.9,1.1,1.2, -0.2,0.04,-0.6], wet:[1.6,1.55,1.5, 0.4,1.3,-2.6] },
      terrace:  { room:[2.8,1.70,2.6, -2.0,1.20,-1.9], floor:[1.2,1.15,1.6, -0.6,0.05,-0.4], wet:[1.2,1.65,1.8, -2.6,1.4,-3.6] }
    };
    function goTo(name) {
      var v = (VIEWS[state.room] || VIEWS.living)[name] || VIEWS[state.room].room;
      camera.position.set(v[0], v[1], v[2]);
      controls.target.set(v[3], v[4], v[5]);
      controls.update();
      document.querySelectorAll('[data-view]').forEach(function (e) {
        e.classList.toggle('on', e.dataset.view === name);
      });
    }

    function showRoom(id) {
      state.room = id;
      Object.keys(ROOMS).forEach(function (k) { ROOMS[k].visible = (k === id); });
      var R = ROOMS[id].userData.R || { w: 9, d: 6.6, h: 3.3 };
      sun.position.set(-R.w * 0.8, R.h * 2.6, R.d * 0.7);
      controls.maxDistance = Math.max(5, Math.min(R.w, R.d) * 1.15);
      document.querySelectorAll('[data-room]').forEach(function (e) {
        e.classList.toggle('on', e.dataset.room === id);
      });
      goTo('room');
      apply();
    }

    /* -------------------------------------------------------- materials -- */

    function tilesPerSide(cm) { return Math.max(2, Math.round(240 / cm)); }

    function apply() {
      var R = (ROOMS[state.room] && ROOMS[state.room].userData.R) || { w: 9, d: 6.6, h: 3.3 };
      if (state.system === 'tile') {
        var n = tilesPerSide(state.tileSize);
        var j = Math.max(3, (1024 / n) * (state.joint / 10) / state.tileSize);
        var o = { tileHex: state.tile.hex, groutHex: state.grout.hex, n: n, j: j,
                  veins: state.tile.veins };
        var patch = n * state.tileSize / 100;
        M.floor.map = tex(tileCanvas(o), R.w / patch, R.d / patch);          // per axis
        M.floor.roughnessMap = tex(roughCanvas(o), R.w / patch, R.d / patch);
        M.floor.bumpMap = tex(bumpCanvas(o), R.w / patch, R.d / patch);
        M.floor.bumpScale = 2.2; M.floor.color.set('#FFFFFF'); M.floor.roughness = 1.0;
      } else {
        M.floor.map = tex(woodCanvas(state.wood.hex), R.w / 2.4, R.d / 2.4);
        M.floor.roughnessMap = null; M.floor.bumpMap = null;
        M.floor.color.set('#FFFFFF'); M.floor.roughness = 0.56;
      }
      M.floor.needsUpdate = true;

      M.wall.color.set(plaster ? state.wall.hex : state.wall.hex);
      M.wall.needsUpdate = true;

      if (state.wetArea) {
        var n2 = tilesPerSide(state.tileSize);
        var j2 = Math.max(3, (1024 / n2) * (state.joint / 10) / state.tileSize);
        var o2 = { tileHex: state.tile.hex, groutHex: state.grout.hex, n: n2, j: j2,
                   veins: state.tile.veins };
        var p2 = n2 * state.tileSize / 100;
        M.feat.map = tex(tileCanvas(o2), R.w / p2, R.h / p2);
        M.feat.roughnessMap = tex(roughCanvas(o2), R.w / p2, R.h / p2);
        M.feat.bumpMap = tex(bumpCanvas(o2), R.w / p2, R.h / p2);
        M.feat.bumpScale = 2.2; M.feat.color.set('#FFFFFF'); M.feat.roughness = 1.0;
      } else {
        M.feat.map = M.feat.roughnessMap = M.feat.bumpMap = null;
        M.feat.color.set(state.wall.hex); M.feat.roughness = 0.94;
      }
      M.feat.needsUpdate = true;
      renderSpec();
    }

    /* ---------------------------------------------------- specification -- */

    function specLines() {
      var out = [];
      if (state.system === 'tile') {
        out.push([state.wetArea ? 'adhesiveSuperPlus' : 'adhesiveSuper',
                  state.tileSize + ' × ' + state.tileSize + ' cm format']);
        out.push([state.joint <= 4 ? 'groutSuperPolymer' : 'groutPolymer',
                  state.grout.code + ' ' + state.grout.name + ' · ' + state.joint + ' mm joint']);
        out.push(['groutSealer', 'Floor joints']);
      } else {
        out.push(['swissparkett', state.wood.name]);
        out.push(['skimPremium', 'Substrate preparation']);
      }
      out.push(['skimPremium', 'Walls · ' + state.wall.name]);
      if (state.wetArea) {
        out.push(['aquaShield', 'Feature wall, wet area']);
        out.push(['sw101', 'Wet area joints · 12 epoxy shades']);
        out.push(['silicone', 'Perimeter and corner joints']);
      }
      var merged = [], seen = {};
      out.forEach(function (r) {
        if (seen[r[0]] !== undefined) { merged[seen[r[0]]][1] += ' · ' + r[1]; return; }
        seen[r[0]] = merged.length; merged.push([r[0], r[1]]);
      });
      return merged;
    }

    function renderSpec() {
      var rows = specLines();
      document.getElementById('spec').innerHTML = rows.map(function (r) {
        var p = SW.products[r[0]];
        return '<div class="spec-row">' +
          '<span class="spec-thumb"><img src="' + SW.img(p.img) + '" alt=""></span>' +
          '<span class="spec-txt"><span class="spec-p">' + p.name + '</span>' +
          '<span class="spec-d">' + r[1] + '</span>' +
          (p.pack ? '<span class="spec-k">' + p.pack + (p.std ? ' · ' + p.std : '') + '</span>' : '') +
          '</span></div>';
      }).join('');
      document.getElementById('specN').textContent = rows.length;
    }

    /* --------------------------------------------------------------- UI -- */

    function keyOf(x) { return x && (x.code !== undefined ? 'c:' + x.code : 'i:' + x.id); }

    function swatches(host, list, cur, pick, mini) {
      var el = document.getElementById(host); if (!el) return;
      el.innerHTML = ''; var ck = keyOf(cur());
      list.forEach(function (it) {
        var b = document.createElement('button');
        b.className = (mini ? 'sw mini' : 'sw') + (keyOf(it) === ck ? ' on' : '');
        b.title = (it.code ? it.code + ' ' : '') + it.name;
        b.innerHTML = '<span class="chipc" style="background:' + it.hex + '"></span>' +
          (mini ? '' : '<span class="swn">' + it.name + '</span>');
        b.onclick = function () { pick(it); build(); apply(); };
        el.appendChild(b);
      });
    }

    function build() {
      swatches('swTile', SW.tileFinishes, function () { return state.tile; }, function (v) { state.tile = v; });
      swatches('swGrout', SW.groutShades, function () { return state.grout; }, function (v) { state.grout = v; }, true);
      swatches('swWood', SW.timbers, function () { return state.wood; }, function (v) { state.wood = v; });
      swatches('swWall', SW.wallFinishes, function () { return state.wall; }, function (v) { state.wall = v; });
      document.getElementById('groutPick').textContent = state.grout.code + ' ' + state.grout.name;
      document.getElementById('grpTile').style.display = state.system === 'tile' ? '' : 'none';
      document.getElementById('grpWood').style.display = state.system === 'wood' ? '' : 'none';
      document.querySelectorAll('[data-sys]').forEach(function (e) {
        e.classList.toggle('on', e.dataset.sys === state.system); });
      document.getElementById('wetBtn').classList.toggle('on', state.wetArea);
      document.getElementById('sizeVal').textContent = state.tileSize + ' cm';
      document.getElementById('jointVal').textContent = state.joint + ' mm';
    }

    document.querySelectorAll('[data-room]').forEach(function (e) {
      e.onclick = function () { showRoom(e.dataset.room); };
    });
    document.querySelectorAll('[data-sys]').forEach(function (e) {
      e.onclick = function () { state.system = e.dataset.sys; build(); apply(); }; });
    document.getElementById('wetBtn').onclick = function () {
      state.wetArea = !state.wetArea; build(); apply(); };
    document.getElementById('sizeRange').oninput = function (e) {
      state.tileSize = +e.target.value; build(); apply(); };
    document.getElementById('jointRange').oninput = function (e) {
      state.joint = +e.target.value; build(); apply(); };
    document.querySelectorAll('[data-view]').forEach(function (e) {
      e.onclick = function () { goTo(e.dataset.view); }; });

    document.getElementById('shotBtn').onclick = function () {
      renderer.render(scene, camera);
      var a = document.createElement('a');
      a.download = 'swisstek-specification.png';
      a.href = renderer.domElement.toDataURL('image/png'); a.click();
    };
    document.getElementById('enqBtn').onclick = function () {
      document.getElementById('modalList').innerHTML = specLines().map(function (r) {
        var p = SW.products[r[0]];
        return '<li><b>' + p.name + (p.pack ? ' <em>' + p.pack + '</em>' : '') +
          '</b><span>' + r[1] + '</span></li>';
      }).join('');
      document.getElementById('modal').style.display = 'flex';
    };
    document.getElementById('modalClose').onclick = function () {
      document.getElementById('modal').style.display = 'none'; };

    function resize() {
      var w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();

    renderer.setAnimationLoop(function () {
      controls.update(); renderer.render(scene, camera);
    });

    build();
    showRoom('living');
    var ld = document.getElementById('ld');
    if (ld) ld.classList.add('gone');
    window.__ready = true;
    window.__state = state;
    window.__showRoom = showRoom;
    window.__specLines = specLines;
  }

  requestAnimationFrame(function () { requestAnimationFrame(boot); });
})();
