// Home page: first-visit logo splash (from the brand guide) and gentle photo parallax.
(function () {
  var root = document.documentElement;
  var css = getComputedStyle(root);
  var ms = function (name, fallback) { var v = parseFloat(css.getPropertyValue(name)); return isNaN(v) ? fallback : v; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Splash: only on the first visit, never traps the page -----
  var splash = document.getElementById('splash');
  if (splash) {
    var gone = false;
    var clear = function () {
      if (gone) return;
      gone = true;
      root.classList.remove('splashing');
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    };
    if (!root.classList.contains('anim') || reduce) {
      clear();
    } else {
      try { localStorage.setItem('cl-seen-splash', '1'); } catch (e) {}
      root.classList.add('splashing');
      setTimeout(function () {
        splash.classList.add('out');
        setTimeout(clear, ms('--motion-splash-out', 560) + 40);
      }, ms('--motion-splash-hold', 1250));
      setTimeout(clear, 5000); // failsafe
    }
  }

  // ----- Parallax: photos drift slower than the page -----
  if (reduce) return;
  var strength = parseFloat(css.getPropertyValue('--motion-parallax-strength')) || 0.18;
  var imgs = [].slice.call(document.querySelectorAll('[data-parallax] img'));
  if (!imgs.length) return;
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    imgs.forEach(function (img) {
      var box = img.parentNode.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      var offset = (box.top + box.height / 2 - vh / 2) * -strength;
      var max = box.height * 0.1;
      img.style.transform = 'translate3d(0,' + Math.max(-max, Math.min(max, offset)).toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();
