/* ==========================================================================
   ACCESS GATE AND ATTRIBUTION BANNER

   HONEST DESCRIPTION OF WHAT THIS IS. This is a courtesy lock, not security.
   The site is a folder of static files on a public host, so anyone who reads
   the page source or requests an asset directly can reach the content without
   ever seeing this screen. What it does do is stop a forwarded link from
   opening straight into the showroom for someone the link was not meant for,
   which is the actual risk when a pitch link travels beyond the room.

   The passphrase is not stored here. What is stored is a SHA-256 digest of it,
   so the phrase is not sitting in plain sight in the source. A short phrase is
   still guessable by anyone determined, which is the point above.

   TO CHANGE THE PASSPHRASE
     1. Open assets/js/gate.js
     2. Replace the HASH value below with the digest of your new phrase
     3. Generate the digest in any browser console:
          crypto.subtle.digest('SHA-256', new TextEncoder().encode('your phrase'))
            .then(b => console.log([...new Uint8Array(b)]
              .map(x => x.toString(16).padStart(2,'0')).join('')))
     4. Commit the file. The change is live in about a minute.

   TO REMOVE THE GATE ENTIRELY
     Set OPEN to true below. The banner stays, the lock screen does not appear.
   ========================================================================== */

(function (w, d) {
  'use strict';

  var OPEN = false;
  var HASH = '2c57c7a59825f14f654e0eddf742343bad8fe78679bbafc1f5c5cd513eb78e48';          /* SHA-256 of the passphrase */
  var KEY  = 'sw.pitch.open';

  var CLIENT = 'Swisstek Ceylon PLC';
  var AGENCY = 'Artslab Creatives';

  /* Hide before first paint. A class on the root element rather than a style
     wipe, so the page reappears in one step instead of flickering through a
     half painted state. */
  if (!OPEN) d.documentElement.className += ' locked';

  function unlocked() {
    try { return w.sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { w.sessionStorage.setItem(KEY, '1'); } catch (e) { /* private mode */ }
  }

  /* crypto.subtle exists on https and on localhost, which covers every way this
     build is meant to be opened. The fallback is only so a misconfigured host
     shows a working lock rather than a dead form. */
  function digest(text) {
    if (w.crypto && w.crypto.subtle && w.crypto.subtle.digest) {
      return w.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(function (b) {
          return Array.prototype.map.call(new Uint8Array(b), function (x) {
            return x.toString(16).padStart(2, '0');
          }).join('');
        });
    }
    var h = 5381, i = 0;
    for (; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return Promise.resolve('fnv' + h.toString(16));
  }

  function open() {
    d.documentElement.classList.remove('locked');
    var g = d.getElementById('gate');
    if (g) g.remove();
  }

  function banner() {
    /* The immersive viewers are full bleed by design and a bar across the top
       would sit on the chrome, so the line goes on the two pages that frame
       the work: the home page and the hub where the three routes are chosen. */
    if (/direction-0\d\.html$/.test(location.pathname)) return;
    var b = d.createElement('div');
    b.className = 'pbanner';
    b.innerHTML = '<span class="pbanner__d" aria-hidden="true"></span>' +
      '<span><b>Concept demonstration</b> prepared by ' + AGENCY +
      ' for ' + CLIENT + '. Not a live ' + CLIENT.split(' ')[0] + ' property.</span>';
    d.body.insertBefore(b, d.body.firstChild);
    d.body.classList.add('has-pbanner');
  }

  function lock() {
    var g = d.createElement('div');
    g.id = 'gate'; g.className = 'gate';
    g.innerHTML =
      '<form class="gate__c" id="gateF" autocomplete="off">' +
        '<img class="gate__logo" src="' + (location.pathname.indexOf('/showroom/') > -1 ? '../' : '') +
          'assets/img/logo.webp" alt="Swisstek">' +
        '<div class="mono red gate__k">Private preview</div>' +
        '<h1 class="gate__t">Swisstek virtual showroom</h1>' +
        '<p class="gate__p">A concept demonstration prepared by ' + AGENCY + ' for ' +
          CLIENT + '. Enter the passphrase you were given to continue.</p>' +
        '<label class="gate__l" for="gateI">Passphrase</label>' +
        '<input class="gate__i" id="gateI" type="password" autocomplete="off" ' +
          'spellcheck="false" autocapitalize="off">' +
        '<button class="gate__b" type="submit">Enter the showroom</button>' +
        '<div class="gate__e" id="gateE" role="alert"></div>' +
      '</form>';
    d.body.appendChild(g);

    var f = d.getElementById('gateF'), i = d.getElementById('gateI'), e = d.getElementById('gateE');
    i.focus();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      digest(i.value.trim().toLowerCase()).then(function (h) {
        if (h === HASH) { remember(); open(); banner(); }
        else {
          e.textContent = 'That passphrase is not right. Check it with whoever sent you the link.';
          i.value = ''; i.focus();
        }
      });
    });
  }

  function boot() {
    if (OPEN || unlocked()) { open(); banner(); return; }
    lock();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
