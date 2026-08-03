/* Shared site behaviour: scroll reveal, product/category rendering helpers. */
(function () {
  'use strict';

  /* reveal on scroll */
  function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (e, i) {
      e.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
      io.observe(e);
    });
  }

  /* render the 25 real grout shades as a chart */
  window.renderShades = function (host, shades, opts) {
    opts = opts || {};
    host.innerHTML = shades.map(function (s) {
      return '<button class="sh" type="button" title="' + s.code + ' ' + s.name + '">' +
        '<span class="sh__c" style="background:' + s.hex + '"></span>' +
        '<span class="sh__k">' + s.code + '</span>' +
        '<span class="sh__n">' + s.name + '</span>' +
        '</button>';
    }).join('');
    if (opts.onPick) {
      host.querySelectorAll('.sh').forEach(function (b, i) {
        b.addEventListener('click', function () {
          host.querySelectorAll('.sh').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          opts.onPick(shades[i]);
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', reveal);
})();
