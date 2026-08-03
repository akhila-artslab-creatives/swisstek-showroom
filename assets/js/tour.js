/* ==========================================================================
   SWISSTEK SHOWROOM TOUR ENGINE

   One engine, two wrappers. Direction 01 leads with product categories,
   Direction 02 leads with individual products. Both walk the same ten spaces
   and share one specification, which is exactly the proposal's argument: the
   360 routes are the same content layer in a different wrapper.

   Spaces, route order and hotspot angles come from SPACES below. Angles were
   picked by scripts/find-viewpoints.py, which scores each longitude of the
   panorama for edge detail and colour and returns the peaks, so markers land
   on displays rather than on blank wall. Viewer yaw is the negative of
   panorama longitude; see that script for the convention.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------- spaces -- */

  var P = '../assets/pano/';
  var SPACES = [
    { id:'atrium', name:'Entrance atrium', short:'Atrium', yaw:135, pitch:-9,
      blurb:'Reception and orientation. Every collection leads off from here.',
      cat:'finishing',
      spots:[ {y:135,p:-2,k:'p',v:'groutPolymer'}, {y:-133,p:-4,k:'p',v:'adhesiveUltraGrip'},
              {y:85,p:2,k:'c',v:'finishing'},      {y:-67,p:-6,k:'c',v:'beautification'},
              {y:47,p:-14,k:'c',v:'cleaning'} ] },

    { id:'tiling', name:'Tile installation', short:'Tiling', yaw:89, pitch:-9,
      blurb:'Adhesives, grout and the full 25 shade chart.', cat:'finishing',
      spots:[ {y:89,p:0,k:'p',v:'groutPolymer'},   {y:-89,p:-2,k:'p',v:'adhesiveSuperPlus'},
              {y:-37,p:2,k:'p',v:'groutSuperPolymer'}, {y:37,p:-6,k:'p',v:'adhesiveSuper'},
              {y:179,p:-4,k:'p',v:'groutSealer'} ] },

    { id:'wetarea', name:'Wet area', short:'Wet area', yaw:13, pitch:-9,
      blurb:'Waterproofing, epoxy grout and sealant for showers and pools.',
      cat:'finishing',
      spots:[ {y:13,p:2,k:'p',v:'aquaShield'},     {y:-131,p:-2,k:'p',v:'sw101'},
              {y:61,p:-4,k:'p',v:'silicone'},      {y:155,p:-6,k:'p',v:'adhesiveSuperPlus'} ] },

    { id:'walls', name:'Wall finishing', short:'Walls', yaw:167, pitch:-9,
      blurb:'Skim coat systems for interior and exterior walls.', cat:'finishing',
      spots:[ {y:167,p:0,k:'p',v:'skimPremium'},   {y:119,p:-2,k:'p',v:'skimDeluxe'},
              {y:-121,p:-4,k:'c',v:'finishing'} ] },

    { id:'flooring', name:'Swissparkett flooring', short:'Flooring', yaw:-39, pitch:-9,
      blurb:'Solid timber flooring in six species.', cat:'finishing',
      spots:[ {y:-39,p:-6,k:'p',v:'swissparkett'}, {y:-89,p:-2,k:'p',v:'swissparkett'},
              {y:61,p:-8,k:'p',v:'skimPremium'} ] },

    { id:'roofing', name:'Roof Master', short:'Roofing', yaw:161, pitch:-9,
      blurb:'Roofing profiles and colours. Product records to be confirmed.',
      cat:'roofing',
      spots:[ {y:161,p:6,k:'c',v:'roofing'},       {y:-13,p:4,k:'c',v:'roofing'},
              {y:25,p:-10,k:'p',v:'aquaShield'} ] },

    { id:'pebbles', name:'Decorative pebbles', short:'Pebbles', yaw:-43, pitch:-9,
      blurb:'Landscaping pebbles in white, grey, black and brown.',
      cat:'beautification',
      spots:[ {y:-43,p:-8,k:'c',v:'beautification'}, {y:77,p:-12,k:'c',v:'beautification'},
              {y:29,p:-4,k:'c',v:'cleaning'} ] },

    { id:'aluarch', name:'Aluminium architectural', short:'Alu systems', yaw:-59, pitch:-9,
      blurb:'Sliding and swing systems, curtain wall, partitions and louvres.',
      cat:'alu-arch',
      spots:[ {y:-59,p:0,k:'a',v:'alu-arch'},      {y:-5,p:-2,k:'a',v:'alu-arch'},
              {y:63,p:-4,k:'a',v:'alu-solar'} ] },

    { id:'aluhouse', name:'Aluminium hardware', short:'Alu hardware', yaw:71, pitch:-9,
      blurb:'Extrusions, angles, tubes, ladders and household products.',
      cat:'alu-hardware',
      spots:[ {y:71,p:0,k:'a',v:'alu-hardware'},   {y:165,p:-2,k:'a',v:'alu-household'},
              {y:125,p:-6,k:'a',v:'alu-hardware'} ] },

    { id:'specdesk', name:'Specification desk', short:'Spec desk', yaw:-129, pitch:-9,
      blurb:'Where a browsing session becomes a qualified enquiry.',
      cat:'finishing',
      spots:[ {y:-129,p:-4,k:'p',v:'groutPolymer'}, {y:-63,p:-6,k:'p',v:'groutSealer'},
              {y:49,p:-2,k:'c',v:'finishing'} ] }
  ];

  SPACES.forEach(function (s) {
    s.img = P + s.id + '.webp';
    s.th  = P + s.id + '-th.webp';
  });

  /* ------------------------------------------------------------- helpers -- */

  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]; }); }

  /* --------------------------------------------------------------- Tour -- */

  function Tour(opts) {
    var self = this;
    /* mode genuinely drives the journey. 'category' is Direction 01: zone
       gateways with permanent name plates and a persistent category index,
       where you pick a product family. 'product' is Direction 02: small pins
       on individual products, a card where you clicked, and a mini-map route. */
    this.mode = opts.mode || 'product';
    document.body.classList.add(this.mode === 'category' ? 'm-cat' : 'm-prod');
    this.i = 0;
    this.spec = [];
    this.compare = [];
    this.active = null;

    /* Auto-rotate drifts the view off the markers while someone is reading a
       panel, and in a demo that reads as the page moving on its own. Off. */
    this.v = new window.Pano($('view'), { autoRotate: false });
    this.layer = $('hs');

    this.paintRail();
    this.paintGrid();
    /* Films are a Direction 02 device. Direction 01 is a category walk and
       stays exactly as it was, so none of this markup is built for it. */
    if (this.mode === 'product') this.buildFilms();
    this.wire();

    this.v.load(SPACES[0], function () {
      self.enter(SPACES[0]);
      setTimeout(function () { $('ld').classList.add('gone'); }, 240);
      window.__ready = true;
    });
    window.__tour = this;
  }

  Tour.prototype.space = function () { return SPACES[this.i]; };

  /* Category zones for a space: its own collection plus whatever gateways the
     space already carries, so Direction 01 always has something to click. */
  Tour.prototype.zonesFor = function (s) {
    /* Zone gateways are placed at fixed offsets AROUND the entry view, not at
       whatever angle a product happened to sit at. Direction 01 is about
       walking up to a family of products, so at least two plates have to be in
       frame the moment you arrive, in every space. The first two offsets sit
       inside the horizontal field of view at the default 84 degree setting. */
    var order = [s.cat].concat(SW.collections.map(function (c) { return c.id; }),
                               SW.aluminium.categories.map(function (a) { return a.id; }));
    var seen = {}, ids = [];
    order.forEach(function (id) { if (!seen[id]) { seen[id] = 1; ids.push(id); } });
    var offs = [-34, 33, -92, 95];
    return ids.slice(0, 4).map(function (id, i) {
      return { y: s.yaw + offs[i], p: i < 2 ? -3 : -6,
               k: (id.indexOf('alu-') === 0 ? 'a' : 'c'), v: id };
    });
  };

  /* Product pins for a space. Placed at fixed offsets around the entry view
     for the same reason as the zones: every panorama was regenerated, so any
     angle tied to a specific object in an older render is meaningless now.
     Aluminium spaces carry aluminium category pins, because individual
     aluminium SKUs have no pack shot to put on a card. */
  Tour.prototype.productsFor = function (s) {
    var offs = [-40, 38, -95, 96];
    if (s.cat.indexOf('alu-') === 0) {
      var alu = SW.aluminium.categories.map(function (a) { return a.id; });
      var first = alu.indexOf(s.cat); if (first > 0) alu.splice(0, 0, alu.splice(first, 1)[0]);
      return alu.slice(0, 4).map(function (id, i) {
        return { y: s.yaw + offs[i], p: i < 2 ? -3 : -6, k: 'a', v: id };
      });
    }
    var c = SW.collections.filter(function (x) { return x.id === s.cat; })[0];
    var own = s.spots.filter(function (h) { return h.k === 'p'; }).map(function (h) { return h.v; });
    var pool = own.concat(((c && c.products) || []).filter(function (k) {
      return own.indexOf(k) === -1;
    }));
    if (!pool.length) pool = ['groutPolymer', 'adhesiveUltraGrip', 'aquaShield', 'skimPremium'];
    return pool.slice(0, 4).map(function (k, i) {
      return { y: s.yaw + offs[i], p: i < 2 ? -3 : -6, k: 'p', v: k };
    });
  };

  /* The film marker. Direction 02 only, and only where Swisstek has actually
     published something for the space. It sits above the product pins and a
     little right of the entry view, so it reads as a screen on the wall
     rather than as a fifth product. */
  Tour.prototype.filmSpotFor = function (s) {
    var list = (SW.spaceFilms && SW.spaceFilms[s.id]) || [];
    if (this.mode !== 'product' || !list.length) return null;
    return { y: s.yaw + 12, p: 13, k: 'v', v: s.id };
  };

  Tour.prototype.enter = function (s) {
    var self = this;
    var src = this.mode === 'category' ? this.zonesFor(s) : this.productsFor(s);
    var film = this.filmSpotFor(s);
    if (film) src = src.concat([film]);
    var list = src.map(function (h) {
      var lab, sub, kind = 'point';
      if (h.k === 'v') {
        var n = SW.spaceFilms[h.v].length;
        kind = 'film';
        lab = 'Watch ' + s.short.toLowerCase();
        sub = n + (n === 1 ? ' Swisstek film' : ' Swisstek films');
      } else if (h.k === 'p') {
        var p = SW.products[h.v];
        lab = p ? p.name : h.v; sub = p && p.pack ? p.pack : '';
      } else if (h.k === 'c') {
        var c = SW.collections.filter(function (x) { return x.id === h.v; })[0];
        lab = c ? c.name : h.v; sub = c ? c.note : '';
      } else {
        var a = SW.aluminium.categories.filter(function (x) { return x.id === h.v; })[0];
        lab = a ? 'Aluminium ' + a.name : h.v; sub = a ? a.products.length + ' products' : '';
      }
      return { yaw: h.y, pitch: h.p, kind: kind, label: lab, sub: sub, k: h.k, v: h.v };
    });
    this.v.setHotspots(this.layer, list, function (h) { self.open(h); });
    if (this.mode === 'category') this.paintCats(s);
    else { this.paintMap(); $('mapName').textContent = s.name; }
    $('spName').textContent = s.name;
    $('spBlurb').textContent = s.blurb;
    $('spNo').textContent = String(this.i + 1).padStart(2, '0');
    this.paintRail();
  };

  /* A space change during a crossfade used to be dropped by the viewer while
     the tour had already advanced its index, so the room, the markers and the
     rail all disagreed. Queue the request and run it when the fade ends. */
  Tour.prototype.go = function (n) {
    var self = this;
    n = (n + SPACES.length) % SPACES.length;
    if (n === this.i && !this._pending) return;
    if (this.v._fading) { this._pending = n; return; }
    this._pending = null;
    this.i = n;
    this.closeCard();
    this.paintRail();
    this.v.goTo(SPACES[n], function () {
      self.enter(SPACES[n]);
      if (self._pending !== null && self._pending !== undefined) {
        var q = self._pending; self._pending = null;
        if (q !== self.i) self.go(q);
      }
    });
  };

  /* --------------------------------------------- 01: category index ---- */

  Tour.prototype.paintCats = function (s) {
    var self = this;
    var items = SW.collections.map(function (c) {
      return { id: c.id, name: c.name, note: c.note, img: SW.scene(c.scene), kind: 'c' };
    }).concat(SW.aluminium.categories.map(function (a) {
      return { id: a.id, name: 'Aluminium ' + a.name, note: a.note,
               img: '../assets/pano/' + a.scene + '-th.webp', kind: 'a' };
    }));
    $('catsList').innerHTML = items.map(function (c) {
      return '<button class="crow' + (c.id === s.cat ? ' on' : '') + '" data-id="' + c.id +
        '" data-k="' + c.kind + '"><img class="crow__i" src="' + c.img + '" alt="">' +
        '<span><span class="crow__n">' + esc(c.name) + '</span>' +
        '<span class="crow__d">' + esc(c.note) + '</span></span></button>';
    }).join('');
    $('catsList').querySelectorAll('.crow').forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.k === 'a') self.openAlu(b.dataset.id);
        else self.openCollection(b.dataset.id);
      };
    });
  };

  /* --------------------------------------------- 02: guided route map ---- */

  Tour.prototype.paintMap = function () {
    var self = this, plan = $('plan');
    if (!plan) return;
    if (!plan.dataset.built) {
      plan.innerHTML = '';
      plan.dataset.built = '1';
    }
    plan.querySelectorAll('.map__pt').forEach(function (e) { e.remove(); });
    // a simple loop layout, enough to show where you are in the route
    var pos = [[18,16],[46,12],[74,16],[86,40],[74,64],[46,60],[18,64],[10,40],[34,86],[66,86]];
    SPACES.forEach(function (sp, i) {
      var b = document.createElement('button');
      b.className = 'map__pt' + (i === self.i ? ' on' : '');
      b.style.left = pos[i % pos.length][0] + '%';
      b.style.top  = pos[i % pos.length][1] + '%';
      b.textContent = i + 1; b.title = sp.name;
      b.onclick = function () { self.go(i); };
      plan.appendChild(b);
    });
  };

  /* ---------------------------------------------------------- space rail -- */

  Tour.prototype.paintRail = function () {
    var self = this;
    $('rail').innerHTML = SPACES.map(function (s, k) {
      return '<button data-k="' + k + '" class="' + (k === self.i ? 'on' : '') + '" title="' + esc(s.name) + '">' +
        '<img class="vp-th" src="' + s.th + '" alt="">' +
        '<span><span class="vp-n">' + esc(s.short) + '</span>' +
        '<span class="vp-k">' + String(k + 1).padStart(2, '0') + '</span></span></button>';
    }).join('');
    $('rail').querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { self.go(+b.dataset.k); };
    });
    var el = $('rail').querySelector('button.on');
    if (el && el.scrollIntoView) el.scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
  };

  Tour.prototype.paintGrid = function () {
    var self = this;
    $('grid').innerHTML = SPACES.map(function (s, k) {
      return '<button data-k="' + k + '"><span class="gcard__img"><img src="' + s.th + '" alt=""></span>' +
        '<span class="gcard__b"><span class="mono red">' + String(k + 1).padStart(2, '0') + '</span>' +
        '<span class="gcard__n">' + esc(s.name) + '</span>' +
        '<span class="gcard__d">' + esc(s.blurb) + '</span></span></button>';
    }).join('');
    $('grid').querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { self.go(+b.dataset.k); $('overlay').classList.remove('open'); };
    });
  };

  /* --------------------------------------------------------------- cards -- */

  Tour.prototype.open = function (h) {
    if (h.k === 'v') this.openFilms(SW.spaceFilms[h.v], SPACES[this.i].name, 'Films for this space');
    else if (h.k === 'p') this.openProduct(h.v, h);
    else if (h.k === 'c') this.openCollection(h.v);
    else this.openAlu(h.v);
  };

  Tour.prototype.shadeSet = function (key) {
    if (key === 'groutPolymer' || key === 'groutSuperPolymer') return SW.groutShades;
    if (key === 'sw101') return SW.epoxyShades;
    if (key === 'swissparkett') return SW.timbers;
    return null;
  };

  Tour.prototype.openProduct = function (key, h) {
    var self = this, p = SW.products[key];
    if (!p) return;
    this.active = key;
    $('cImg').src = SW.img(p.img);
    $('cName').textContent = p.name;
    var meta = [];
    if (p.pack) meta.push('<span class="tag">' + esc(p.pack) + '</span>');
    if (p.std) meta.push('<span class="tag">' + esc(p.std) + '</span>');
    if (p.sls) meta.push('<span class="tag tag--red">' + esc(p.sls) + '</span>');
    $('cMeta').innerHTML = meta.join('');
    $('cBlurb').textContent = p.blurb;

    var set = this.shadeSet(key);
    var chips = $('cChips'), lbl = $('cShade'), filt = $('cFilter');
    if (set) {
      var fams = ['All', 'White', 'Grey', 'Beige', 'Blue', 'Other'];
      filt.style.display = '';
      filt.innerHTML = fams.map(function (f, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-f="' + f + '">' + f + '</button>';
      }).join('');
      var draw = function (fam) {
        var list = set.filter(function (s) {
          if (fam === 'All') return true;
          var n = s.name.toUpperCase();
          if (fam === 'White') return /WHITE|IVORY|CREAM|LILY/.test(n);
          if (fam === 'Grey')  return /GREY|GRAY|BLACK|SLATE|ONYX|SILVER/.test(n);
          if (fam === 'Beige') return /BEIGE|SAND|BAMBOO|BROWN|TERRA|HONEY|LEATHER|TAUARI|TEAK|MERBAU|PYINKADO|TAUKKYAN/.test(n);
          if (fam === 'Blue')  return /BLUE|TOURMALINE|DENIM|OCEAN|SERENITY/.test(n);
          return !/WHITE|IVORY|CREAM|LILY|GREY|GRAY|BLACK|SLATE|ONYX|SILVER|BEIGE|SAND|BAMBOO|BROWN|TERRA|HONEY|LEATHER|BLUE|TOURMALINE|DENIM|OCEAN|SERENITY|TEAK|MERBAU|PYINKADO|TAUKKYAN|TAUARI/.test(n);
        });
        chips.innerHTML = list.map(function (s, i) {
          return '<button class="chip' + (i === 0 ? ' on' : '') + '" style="background:' + s.hex +
            '" title="' + esc((s.code ? s.code + ' ' : '') + s.name) + '"></button>';
        }).join('') || '<span class="small" style="color:var(--soft)">No shades in this family.</span>';
        lbl.textContent = list.length ? (list[0].code ? list[0].code + ' ' : '') + list[0].name +
          '   (' + list.length + ' of ' + set.length + ')' : '';
        chips.querySelectorAll('.chip').forEach(function (c, i) {
          c.onclick = function () {
            chips.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); });
            c.classList.add('on');
            lbl.textContent = (list[i].code ? list[i].code + ' ' : '') + list[i].name +
              '   (' + list.length + ' of ' + set.length + ')';
          };
        });
      };
      draw('All');
      filt.querySelectorAll('.fchip').forEach(function (b) {
        b.onclick = function () {
          filt.querySelectorAll('.fchip').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); draw(b.dataset.f);
        };
      });
    } else { chips.innerHTML = ''; lbl.textContent = ''; filt.style.display = 'none'; }

    /* Direction 02 puts the film where the decision is made, on the product
       card itself, rather than parking it in a separate media section. */
    var wb = $('cFilm');
    if (wb) {
      var films = (SW.productFilms && SW.productFilms[key]) || [];
      if (films.length) {
        wb.style.display = '';
        wb.querySelector('.cfilm__n').textContent =
          films.length === 1 ? 'Watch the film' : 'Watch ' + films.length + ' films';
        wb.onclick = function () { self.openFilms(films, p.name, 'Product film'); };
      } else {
        wb.style.display = 'none';
      }
    }

    this.place(h);
    $('card').classList.add('open');
  };

  /* ------------------------------------------------------------- films ---- */

  /* Playback happens inside the experience, in a white frosted lightbox over
     a paused room, not in a new browser tab. Two constraints shaped this:

     1. The deliverable is opened from file:// as often as from a server, and
        an embedded player needs the network either way. So the frame is given
        a load deadline and there is always a visible escape hatch, rather
        than a silently black rectangle that reads as a broken demo.
     2. The chrome stays white. The player itself is YouTube's, so the frame
        is kept small inside a white surround instead of going edge to edge on
        black, which is what every other 360 tour does. */

  var YT = 'https://www.youtube-nocookie.com/embed/';
  var YW = 'https://www.youtube.com/watch?v=';

  Tour.prototype.buildFilms = function () {
    var self = this;

    /* card action */
    var acts = $('card').querySelector('.pcard__acts');
    if (acts && !$('cFilm')) {
      var b = document.createElement('button');
      b.id = 'cFilm'; b.className = 'cfilm';
      b.innerHTML = '<span class="cfilm__p" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5.6v12.8L19 12z"/></svg></span>' +
        '<span class="cfilm__n">Watch the film</span>';
      acts.insertBefore(b, acts.firstChild);
    }

    /* toolbar entry */
    var seg = document.querySelector('.v-seg');
    if (seg && !$('btnFilm')) {
      var t = document.createElement('button');
      t.id = 'btnFilm'; t.textContent = 'Films';
      seg.insertBefore(t, seg.firstChild);
      t.onclick = function () { self.openLibrary(); };
    }

    /* lightbox */
    if ($('vbox')) return;
    var d = document.createElement('div');
    d.className = 'vbox'; d.id = 'vbox';
    d.innerHTML =
      '<div class="vbox__c" role="dialog" aria-modal="true" aria-label="Swisstek film">' +
        '<div class="vbox__h">' +
          '<div><div class="mono red" id="vbKick">Product film</div>' +
          '<h2 class="panel__ttl" id="vbTtl" style="margin-top:8px;"></h2></div>' +
          '<button class="panel__x" id="vbX" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="vbox__b">' +
          '<div class="vbox__stage">' +
            '<div class="vbox__frame" id="vbFrame">' +
              '<div class="vbox__wait" id="vbWait"><span class="vbox__spin"></span>' +
              '<span class="mono">Loading the film</span></div>' +
              '<div class="vbox__off" id="vbOff">' +
                '<div class="mono red">Playback needs a connection</div>' +
                '<p>This film streams from Swisstek’s own YouTube channel, so it ' +
                   'needs the machine to be online. Everything else in the showroom ' +
                   'works offline.</p>' +
                '<a class="btn btn--sm btn--primary" id="vbOpen" target="_blank" rel="noopener">Open on YouTube</a>' +
              '</div>' +
            '</div>' +
            '<div class="vbox__meta"><div id="vbNow"></div>' +
              '<a class="vbox__ext" id="vbExt" target="_blank" rel="noopener">Open on YouTube' +
              '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 17L17 7M9 7h8v8"/></svg></a>' +
            '</div>' +
          '</div>' +
          '<aside class="vbox__list" id="vbList"></aside>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);

    $('vbX').onclick = function () { self.closeFilms(); };
    d.addEventListener('click', function (e) { if (e.target === d) self.closeFilms(); });
  };

  Tour.prototype.openLibrary = function () {
    var seen = {}, all = [];
    SPACES.forEach(function (s) {
      ((SW.spaceFilms && SW.spaceFilms[s.id]) || []).forEach(function (id) {
        if (!seen[id]) { seen[id] = 1; all.push(id); }
      });
    });
    Object.keys(SW.productFilms || {}).forEach(function (k) {
      SW.productFilms[k].forEach(function (id) {
        if (!seen[id]) { seen[id] = 1; all.push(id); }
      });
    });
    this.openFilms(all, 'The Swisstek film library',
      all.length + ' films from Swisstek Ceylon PLC and Swisstek Aluminium');
  };

  Tour.prototype.openFilms = function (ids, title, kicker) {
    var self = this;
    ids = (ids || []).filter(function (id) { return SW.films[id]; });
    $('vbTtl').textContent = title || 'Films';
    $('vbKick').textContent = kicker || 'Film';
    $('vbList').innerHTML = ids.map(function (id, i) {
      var f = SW.films[id];
      return '<button class="vrow' + (i === 0 ? ' on' : '') + '" data-id="' + id + '" title="' + esc(f.t) + '">' +
        '<span class="vrow__th"><img src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg" alt="" ' +
          'loading="lazy" onerror="this.style.display=\'none\'">' +
          '<span class="vrow__p" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5.6v12.8L19 12z"/></svg></span>' +
          (f.d ? '<span class="vrow__d">' + esc(f.d) + '</span>' : '') + '</span>' +
        '<span class="vrow__b"><span class="vrow__n">' + esc(f.n) + '</span>' +
        '<span class="vrow__k">' + esc(f.k) + ' &middot; ' + esc(f.l) + '</span>' +
        '</span></button>';
    }).join('') || '<div class="vempty"><p class="small">Swisstek has not published a ' +
      'film for this range. Nothing is shown here rather than borrowing one from a ' +
      'neighbouring product.</p></div>';

    $('vbList').querySelectorAll('.vrow').forEach(function (b) {
      b.onclick = function () {
        $('vbList').querySelectorAll('.vrow').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        self.playFilm(b.dataset.id);
      };
    });

    $('vbox').classList.add('open');
    document.body.classList.add('vopen');
    if (ids.length) this.playFilm(ids[0]);
    else this.stopFilm();
  };

  Tour.prototype.playFilm = function (id) {
    var f = SW.films[id];
    if (!f) return;
    var frame = $('vbFrame');
    this.stopFilm();

    $('vbNow').innerHTML = '<span class="vbox__t">' + esc(f.t) + '</span>' +
      '<span class="vbox__c2">' + esc(f.c) + (f.d ? ' &middot; ' + esc(f.d) : '') + '</span>';
    $('vbExt').href = YW + id;
    $('vbOpen').href = YW + id;

    /* Offline has to be detected by probe, not by the iframe's own load
       event. A cross origin frame that fails to reach the network still
       fires load, on its error page, so trusting onload leaves a blank white
       rectangle and a demo that looks broken. Instead a real request is made
       for the film's thumbnail on i.ytimg.com: an image gives a truthful
       onerror. navigator.onLine only ever shortens the wait. */
    var off = $('vbOff'), wait = $('vbWait');
    off.classList.remove('show');
    wait.classList.add('show');

    var self2 = this, settled = false;
    var fail = function () {
      if (settled) return; settled = true;
      self2.stopFilm();
      wait.classList.remove('show'); off.classList.add('show');
    };
    var ok = function () {
      if (settled) return; settled = true;
      wait.classList.remove('show');
    };

    var probe = new Image();
    probe.onload = ok;
    probe.onerror = fail;
    probe.src = 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
    this._filmT = setTimeout(fail, 6000);
    if (navigator.onLine === false) { setTimeout(fail, 60); return; }

    var f2 = document.createElement('iframe');
    f2.id = 'vbIf';
    f2.src = YT + id + '?rel=0&modestbranding=1&playsinline=1';
    f2.title = f.t;
    f2.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f2.setAttribute('allowfullscreen', '');
    f2.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f2.onerror = fail;
    frame.appendChild(f2);
  };

  Tour.prototype.stopFilm = function () {
    clearTimeout(this._filmT);
    var old = $('vbIf');
    if (old) old.remove();
  };

  Tour.prototype.closeFilms = function () {
    this.stopFilm();
    $('vbox').classList.remove('open');
    document.body.classList.remove('vopen');
  };

  Tour.prototype.place = function (h) {
    var W = innerWidth, H = innerHeight, x = W / 2, y = H / 2;
    var hs = h && this.v.hotspots.filter(function (q) { return q.def.v === h.v; })[0];
    if (hs) {
      var m = /translate3d\((-?\d+)px,\s*(-?\d+)px/.exec(hs.el.style.transform);
      if (m) { x = +m[1]; y = +m[2]; }
    }
    var cw = 356, chh = Math.min(620, H - 150);
    $('card').style.left = Math.max(20, Math.min(W - cw - 20, x + 42)) + 'px';
    $('card').style.top  = Math.max(94, Math.min(H - chh - 120, y - 170)) + 'px';
  };

  Tour.prototype.openCollection = function (id) {
    var self = this;
    var c = SW.collections.filter(function (x) { return x.id === id; })[0];
    if (!c) { c = { name:'Roof Master', note:'Roofing range', products:[] }; }
    $('pTitle').textContent = c.name;
    $('pKicker').textContent = c.note;
    var list = (c.products || []).map(function (k) { return SW.products[k]; }).filter(Boolean);
    $('pBody').innerHTML = list.length ? list.map(function (p, i) {
      return '<button class="prow" data-k="' + c.products[i] + '">' +
        '<span class="prow__th"><img src="' + SW.img(p.img) + '" alt=""></span>' +
        '<span><span class="prow__n">' + esc(p.name) + '</span>' +
        '<span class="prow__d">' + esc(p.blurb.slice(0, 84)) + '…</span>' +
        (p.pack ? '<span class="prow__k">' + esc(p.pack + (p.std ? ' · ' + p.std : '')) + '</span>' : '') +
        '</span></button>';
    }).join('') :
      '<div style="padding:28px;"><p class="small">This is a live Swisstek range. Its ' +
      'individual product records were not verified for this demonstration, so nothing ' +
      'is shown here rather than inventing it.</p></div>';
    $('pBody').querySelectorAll('.prow').forEach(function (b) {
      b.onclick = function () { self.openProduct(b.dataset.k, null); };
    });
    $('panel').classList.add('open');
  };

  Tour.prototype.openAlu = function (id) {
    var a = SW.aluminium.categories.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    $('pTitle').textContent = 'Aluminium ' + a.name;
    $('pKicker').textContent = a.note;
    $('pBody').innerHTML =
      '<div style="padding:20px 28px 6px;"><p class="small">' + esc(SW.aluminium.blurb) + '</p></div>' +
      a.products.map(function (n) {
        return '<div class="prow"><span class="prow__th" style="font-family:PlexMono,monospace;' +
          'font-size:11px;color:var(--soft)">AL</span>' +
          '<span><span class="prow__n">' + esc(n) + '</span></span></div>';
      }).join('') +
      (id === 'alu-arch' ? '<div style="padding:18px 28px 26px;"><div class="mono red">Sliding systems</div>' +
        '<p class="small" style="margin-top:8px;">' + SW.aluminium.systems.join(', ') + '</p></div>' : '');
    $('panel').classList.add('open');
  };

  Tour.prototype.closeCard = function () { $('card').classList.remove('open'); };

  /* ------------------------------------------------------ specification -- */

  Tour.prototype.add = function () {
    if (!this.active) return;
    if (this.spec.indexOf(this.active) === -1) this.spec.push(this.active);
    this.paintSpec(); this.closeCard();
    $('specDrawer').classList.add('open');
  };

  Tour.prototype.toCompare = function () {
    if (!this.active) return;
    var k = this.active;
    if (this.compare.indexOf(k) === -1) {
      if (this.compare.length >= 3) this.compare.shift();
      this.compare.push(k);
    }
    this.paintCompare(); this.closeCard();
    $('cmp').classList.add('open');
  };

  Tour.prototype.paintSpec = function () {
    var self = this;
    $('specN').textContent = this.spec.length;
    $('specBody').innerHTML = this.spec.length ? this.spec.map(function (k) {
      var p = SW.products[k];
      return '<div class="prow"><span class="prow__th"><img src="' + SW.img(p.img) + '" alt=""></span>' +
        '<span><span class="prow__n">' + esc(p.name) + '</span>' +
        (p.pack ? '<span class="prow__k">' + esc(p.pack + (p.std ? ' · ' + p.std : '')) + '</span>' : '') +
        '</span><button class="rm" data-k="' + k + '" aria-label="Remove">&times;</button></div>';
    }).join('') : '<div style="padding:30px 28px;"><p class="small">Nothing selected yet. ' +
      'Open a product in the room and add it here.</p></div>';
    $('specBody').querySelectorAll('.rm').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        self.spec = self.spec.filter(function (x) { return x !== b.dataset.k; });
        self.paintSpec();
      };
    });
  };

  Tour.prototype.paintCompare = function () {
    var self = this;
    $('cmpBody').innerHTML = this.compare.length ? this.compare.map(function (k) {
      var p = SW.products[k], set = self.shadeSet(k);
      return '<div class="cmpcol"><div class="cmpcol__img"><img src="' + SW.img(p.img) + '" alt=""></div>' +
        '<div class="cmpcol__n">' + esc(p.name) + '</div>' +
        '<dl><dt>Pack</dt><dd>' + esc(p.pack || 'n/a') + '</dd>' +
        '<dt>Standard</dt><dd>' + esc(p.std || 'n/a') + '</dd>' +
        '<dt>Certification</dt><dd>' + esc(p.sls || 'n/a') + '</dd>' +
        '<dt>Shades</dt><dd>' + (set ? set.length : 'n/a') + '</dd></dl>' +
        '<p class="small">' + esc(p.blurb) + '</p></div>';
    }).join('') : '<div style="padding:30px;"><p class="small">Add two or three products to compare them side by side.</p></div>';
  };

  /* ---------------------------------------------------------------- wire -- */

  Tour.prototype.wire = function () {
    var self = this;
    $('btnNext').onclick = function () { self.go(self.i + 1); };
    $('btnPrev').onclick = function () { self.go(self.i - 1); };
    $('btnAll').onclick  = function () { $('overlay').classList.toggle('open'); };
    $('ovClose').onclick = function () { $('overlay').classList.remove('open'); };
    $('cardX').onclick   = function () { self.closeCard(); };
    $('cAdd').onclick    = function () { self.add(); };
    $('cCmp').onclick    = function () { self.toCompare(); };
    $('pClose').onclick  = function () { $('panel').classList.remove('open'); };
    $('sClose').onclick  = function () { $('specDrawer').classList.remove('open'); };
    $('cmpClose').onclick= function () { $('cmp').classList.remove('open'); };
    $('btnSpec').onclick = function () { self.paintSpec(); $('specDrawer').classList.add('open'); };
    $('btnReset').onclick= function () { self.v.reset(); };
    $('zIn').onclick     = function () { self.v.zoom(-8); };
    $('zOut').onclick    = function () { self.v.zoom(8); };
    $('btnFull').onclick = function () {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    };
    $('btnEnq').onclick = $('sSend').onclick = function () {
      var names = self.spec.map(function (k) { return SW.products[k].name; });
      $('enqList').innerHTML = names.length
        ? names.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('')
        : '<li style="color:var(--soft)">Nothing selected yet</li>';
      $('enq').style.display = 'flex';
    };
    $('enqClose').onclick = function () { $('enq').style.display = 'none'; };
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('vbox') && $('vbox').classList.contains('open')) { self.closeFilms(); return; }
        self.closeCard(); $('panel').classList.remove('open');
        $('overlay').classList.remove('open'); $('specDrawer').classList.remove('open');
        $('cmp').classList.remove('open'); $('enq').style.display = 'none';
      }
      /* n and p walk the route. They must not fire while a film is up, or
         the room changes behind the player and the arrival is missed. */
      if ($('vbox') && $('vbox').classList.contains('open')) return;
      if (e.key === 'n') self.go(self.i + 1);
      if (e.key === 'p') self.go(self.i - 1);
    });
    this.paintSpec(); this.paintCompare();
  };

  window.SPACES = SPACES;
  window.Tour = Tour;
})();
