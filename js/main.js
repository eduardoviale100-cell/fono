/* ==========================================================================
   FonoJex Pro · main.js
   Sin dependencias externas. Secciones:
   1. Utilidades y WhatsApp   2. Menú y scroll-spy   3. Reveal en cascada
   4. Carrusel del Hero       5. Carrusel de gamas  6. Catálogo (gama, búsqueda, orden)
   7. Modal de detalles       8. Comparador 1 vs 1   9. Clientes y lightbox
   10. Modo oscuro
   ========================================================================== */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var PHONE = '51913291289';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  root.classList.add('js');

  /* ---------- 1. Utilidades y enlaces de WhatsApp ---------- */
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function wa(msg) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg); }
  /* Etiquetas comerciales por gama */
  var GAMA = { entrada: 'gama de entrada', media: 'gama media', alta: 'gama alta' };
  /* Mensaje inteligente: modelo exacto + gama + precio */
  function buyMsg(o) { return 'Hola FonoJex Pro, vi el ' + o.name + ' de ' + (GAMA[o.gama] || 'nuestro catálogo') + ' a ' + o.price + ' y quiero aplicar mi descuento.'; }
  /* Mensaje armado para crédito: modelo + gama + precio + interés */
  function creditMsg(o) { return 'Hola FonoJex Pro, quiero comprar a crédito el ' + o.name + ' de ' + (GAMA[o.gama] || 'nuestro catálogo') + ' a ' + o.price + ' (interés de solo 10%). ¿Qué requisitos, plazos y cuotas tienen?'; }
  function setWa(a, msg) { a.href = wa(msg); a.target = '_blank'; a.rel = 'noopener'; }
  $$('.wa').forEach(function (a) { setWa(a, a.dataset.msg || 'Hola FonoJex Pro'); });
  $('#year').textContent = new Date().getFullYear();
  function openDlg(dl) { if (dl.showModal) dl.showModal(); else dl.setAttribute('open', ''); d.body.classList.add('lock'); }
  function closeDlg(dl) { if (dl.close) dl.close(); else dl.removeAttribute('open'); d.body.classList.remove('lock'); }
  $$('dialog').forEach(function (dl) {
    dl.addEventListener('close', function () { d.body.classList.remove('lock'); });
    /* clic en el fondo oscuro cierra la ventana */
    dl.addEventListener('click', function (e) { if (e.target === dl) closeDlg(dl); });
  });

  /* ---------- 2. Menú móvil y sección activa ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function menu(o) { nav.classList.toggle('open', o); d.body.classList.toggle('menu', o); burger.setAttribute('aria-expanded', o); }
  burger.onclick = function () { menu(!nav.classList.contains('open')); };
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') menu(false); });
  d.addEventListener('click', function (e) { if (d.body.classList.contains('menu') && !nav.contains(e.target) && !burger.contains(e.target)) menu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  var hdr = $('#hdr'), links = $$('#nav a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    hdr.classList.toggle('sc', scrollY > 10);
    var y = scrollY + 130, cur = 0;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- 3. Scroll reveal en cascada (IntersectionObserver) ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', (k++ * 0.09) + 's'); /* retraso secuencial */
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- 4. Carrusel del Hero (fundido, imágenes siempre visibles) ---------- */
  (function () {
    var box = $('#hcar'); if (!box) return;
    var sl = $$('.hslide', box), dots = $('#hdots'), cur = 0, timer;
    var dts = sl.map(function (_, i) {
      var b = d.createElement('button'); b.setAttribute('aria-label', 'Ver diapositiva ' + (i + 1));
      b.onclick = function () { go(i); restart(); }; dots.appendChild(b); return b;
    });
    function go(i) {
      cur = (i + sl.length) % sl.length;
      sl.forEach(function (s, k) { s.classList.toggle('on', k === cur); });
      dts.forEach(function (b, k) { b.classList.toggle('on', k === cur); });
    }
    function play() { if (!reduce) timer = setInterval(function () { go(cur + 1); }, 4500); }
    function restart() { clearInterval(timer); play(); }
    $('#hprev').onclick = function () { go(cur - 1); restart(); };
    $('#hnext').onclick = function () { go(cur + 1); restart(); };
    box.addEventListener('pointerenter', function () { clearInterval(timer); });
    box.addEventListener('pointerleave', restart);
    /* deslizar con el dedo */
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); } x0 = null;
    });
    go(0); play();
  })();

  /* ---------- 5. Carrusel de gamas (scroll-snap nativo) ---------- */
  (function () {
    var emN = $('#emb'), dots = $('#dots'); if (!emN) return;
    var sl = $$('.emb-slide', emN), cur = 0, timer;
    var dts = sl.map(function (_, i) {
      var b = d.createElement('button'); b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      b.onclick = function () { go(i); rest(); }; dots.appendChild(b); return b;
    });
    function go(i) { cur = (i + sl.length) % sl.length; emN.scrollTo({ left: sl[cur].offsetLeft - emN.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); }
    function mark() { var i = Math.round(emN.scrollLeft / emN.clientWidth); i = Math.max(0, Math.min(sl.length - 1, i)); cur = i; dts.forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
    emN.addEventListener('scroll', mark, { passive: true });
    $('#eprev').onclick = function () { go(cur - 1); rest(); };
    $('#enext').onclick = function () { go(cur + 1); rest(); };
    emN.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(cur + 1); rest(); } if (e.key === 'ArrowLeft') { go(cur - 1); rest(); } });
    function play() { if (!reduce) timer = setInterval(function () { go(cur + 1); }, 5200); }
    function rest() { clearInterval(timer); play(); }
    emN.addEventListener('pointerenter', function () { clearInterval(timer); }); emN.addEventListener('pointerleave', rest);
    addEventListener('resize', function () { emN.scrollLeft = sl[cur].offsetLeft - emN.offsetLeft; });
    mark(); play();
  })();

  /* ---------- 6. Catálogo: gama + búsqueda + orden ---------- */
  var grid = $('#grid'), cards = $$('#grid .card'), chips = $$('#gamas .chip');
  var qIn = $('#q'), sortSel = $('#sort'), emptyMsg = $('#empty'), gama = 'all';
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function applyCatalog() {
    var q = norm(qIn.value.trim()), vis = [];
    cards.forEach(function (c) {
      var ok = (gama === 'all' || c.dataset.gama === gama) && (!q || norm(c.dataset.name + ' ' + (GAMA[c.dataset.gama] || '')).indexOf(q) > -1);
      c.hidden = !ok; if (ok) vis.push(c);
    });
    var mode = sortSel.value;
    var ordered = cards.slice().sort(function (a, b) {
      if (mode === 'asc') return a.dataset.price - b.dataset.price;
      if (mode === 'desc') return b.dataset.price - a.dataset.price;
      return a.dataset.i - b.dataset.i;
    });
    ordered.forEach(function (c) { grid.appendChild(c); });
    vis.forEach(function (c, k) { /* animación de re-entrada */
      c.classList.add('in'); c.classList.remove('pop'); void c.offsetWidth;
      c.style.setProperty('--d', (k * 0.05) + 's'); c.classList.add('pop');
    });
    emptyMsg.hidden = vis.length > 0;
  }
  chips.forEach(function (c) { c.onclick = function () { chips.forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); setGama(c.dataset.f); }; });
  /* Activa una gama desde chips o desde el carrusel de gamas */
  function setGama(g) {
    gama = g;
    chips.forEach(function (x) { var on = x.dataset.f === g; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    applyCatalog();
  }
  chips.forEach(function (x) { x.setAttribute('aria-pressed', x.classList.contains('on')); });
  $$('[data-gama-go]').forEach(function (b) {
    b.onclick = function () { setGama(b.dataset.gamaGo); $('#equipos').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  });
  /* Precio anterior tachado: se activa con "old" en data-d (ej. "old":"S/ 699"); el % se calcula solo */
  function offOf(o) { var a = parseInt(String(o.old || '').replace(/\D/g, ''), 10); return a > o.num ? Math.round((1 - o.num / a) * 100) : 0; }
  cards.forEach(function (c) {
    var o = JSON.parse(c.dataset.d); if (!offOf(o)) return;
    var pr = $('.price', c), sm = $('small', pr), b = $('b', pr), w = d.createElement('span'), e = d.createElement('em'), s = d.createElement('s');
    sm.textContent = 'Antes '; s.textContent = o.old; sm.appendChild(s);
    w.className = 'pr'; pr.insertBefore(w, b); w.appendChild(b);
    e.className = 'off'; e.textContent = '-' + offOf(o) + '%'; w.appendChild(e);
  });
  /* Hero: nombre, especificación y precios salen de la tarjeta del catálogo (una sola fuente de datos) */
  $$('.hslide .hcap').forEach(function (h) {
    var bt = $('[data-p]', h), c = bt && cards.filter(function (x) { return +x.dataset.i === +bt.dataset.p; })[0]; if (!c) return;
    var o = JSON.parse(c.dataset.d), old = $('.hc-old', h), sp = $('.specs li', c), off = offOf(o);
    $('.hc-now strong', h).textContent = o.price; $('.hc-now small', h).textContent = off ? 'Oferta' : 'Precio';
    if (sp) $('.hc-spec', h).textContent = sp.textContent.trim();
    old.hidden = !off; if (off) { $('s', old).textContent = o.old; $('em', old).textContent = 'Ahorras S/ ' + (parseInt(o.old.replace(/\D/g, ''), 10) - o.num); }
  });

  /* Imagen principal del inicio: al tocar el celular se abren sus detalles */
  $$('.hslide').forEach(function (sl) {
    var bt = $('[data-p]', sl), box = $('.carousel-img-container', sl), im = box && $('img', box); if (!bt || !box) return;
    box.setAttribute('role', 'button'); box.setAttribute('tabindex', '0'); box.setAttribute('aria-label', 'Ver detalles de ' + (im ? im.alt : 'este celular'));
    box.addEventListener('click', function () { bt.click(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bt.click(); } });
  });

  /* WhatsApp inteligente: cada tarjeta envía modelo + gama + precio */
  cards.forEach(function (c) { var o = JSON.parse(c.dataset.d); var a = $('a.wa', c); if (a) setWa(a, buyMsg(o)); });
  qIn.addEventListener('input', applyCatalog); sortSel.addEventListener('change', applyCatalog);

  /* ---------- 7. Modal de detalles ---------- */
  var pd = $('#pd'), pdw = $('#pdw'), pdc = $('#pdc');
  function openP(card) {
    var o = JSON.parse(card.dataset.d), im = $('.pd-pic img', pd);
    im.src = o.img; im.alt = o.name; im.className = /zte/.test(o.img) ? 'mult' : '';
    $('#pdb').textContent = o.badge; $('#pdn').textContent = o.name;
    var pp = $('#pdp'); pp.textContent = o.price;
    if (offOf(o)) { var os = d.createElement('s'), oe = d.createElement('em'); os.textContent = o.old; oe.textContent = '-' + offOf(o) + '%'; pp.appendChild(os); pp.appendChild(oe); }
    $('#pdd').textContent = o.desc || '';
    var pk = $('#pdk'); pk.innerHTML = '';
    (o.perks || []).forEach(function (t) {
      var li = d.createElement('li');
      li.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-check"/></svg>'; li.appendChild(d.createTextNode(t)); pk.appendChild(li);
    });
    var dl = $('#pds'); dl.innerHTML = '';
    if (o.rows.length) o.rows.forEach(function (r) {
      var row = d.createElement('div'), a = d.createElement('dt'), b = d.createElement('dd');
      a.textContent = r[0]; b.textContent = r[1]; row.appendChild(a); row.appendChild(b); dl.appendChild(row);
    });
    else { var p = d.createElement('p'); p.textContent = 'Escríbenos por WhatsApp y te enviamos las especificaciones completas de este equipo.'; dl.appendChild(p); }
    setWa(pdw, buyMsg(o));
    setWa(pdc, creditMsg(o));
    $('.pd-scroll', pd).scrollTop = 0;
    openDlg(pd);
    requestAnimationFrame(function () { $('.pd-scroll', pd).scrollTop = 0; });
  }
  cards.forEach(function (c) {
    c.addEventListener('click', function (e) { if (e.target.closest('a.wa,.cmp')) return; openP(c); });
    c.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); openP(c); } });
  });
  /* botones "Ver detalles" de los carruseles: data-p = posición original de la tarjeta */
  $$('[data-p]').forEach(function (b) {
    b.onclick = function () { var c = cards.filter(function (x) { return +x.dataset.i === +b.dataset.p; })[0]; if (c) openP(c); };
  });
  $('.pd-x', pd).onclick = function () { closeDlg(pd); };
  $('.pd-close', pd).onclick = function () { closeDlg(pd); };
  pdw.addEventListener('click', function () { setTimeout(function () { closeDlg(pd); }, 150); });
  pdc.addEventListener('click', function () { setTimeout(function () { closeDlg(pd); }, 150); });

  /* ---------- 8. Comparador rápido 1 vs 1 ---------- */
  var cbar = $('#cbar'), cbt = $('#cbt'), cbgo = $('#cbgo'), cm = $('#cm'), sel = [];
  var KEYS = ['Pantalla', 'Procesador', 'RAM', 'Almacenamiento', 'Cámara', 'Batería', 'Carga'];
  function refreshBar() {
    cbar.hidden = sel.length === 0;
    cbt.textContent = sel.length === 1 ? 'Elige un equipo más para comparar' : sel.length === 2 ? sel[0].name + ' vs ' + sel[1].name : '';
    cbgo.disabled = sel.length < 2;
    cards.forEach(function (c) {
      var on = sel.some(function (s) { return s.card === c; });
      $('.cmp-i', c).checked = on; c.classList.toggle('picked', on);
    });
  }
  cards.forEach(function (c) {
    $('.cmp-i', c).addEventListener('change', function (e) {
      var o = JSON.parse(c.dataset.d);
      if (e.target.checked) { sel.push({ card: c, name: o.name }); if (sel.length > 2) sel.shift(); } /* máx. 2: reemplaza el más antiguo */
      else sel = sel.filter(function (s) { return s.card !== c; });
      refreshBar();
    });
  });
  $('#cbx').onclick = function () { sel = []; refreshBar(); };
  cbgo.onclick = function () {
    var A = JSON.parse(sel[0].card.dataset.d), B = JSON.parse(sel[1].card.dataset.d);
    var t = $('#cmtab'), html = '<thead><tr><th></th>';
    [A, B].forEach(function (o) {
      html += '<th><img src="' + o.img + '" alt="' + o.name + '"><b>' + o.name + '</b><span>' + o.price + '</span></th>';
    });
    html += '</tr></thead><tbody>';
    KEYS.forEach(function (k) {
      html += '<tr><td>' + k + '</td><td>' + (A.cmp[k] || 'Consultar') + '</td><td>' + (B.cmp[k] || 'Consultar') + '</td></tr>';
    });
    html += '<tr class="cm-act"><td></td>';
    [A, B].forEach(function (o) { html += '<td><a class="btn btn-p" target="_blank" rel="noopener" href="' + wa(buyMsg(o)) + '">Consultar</a></td>'; });
    t.innerHTML = html + '</tr></tbody>';
    openDlg(cm);
  };
  $('#cmx').onclick = function () { closeDlg(cm); };

  /* ---------- 9. Clientes: carrusel y lightbox ---------- */
  var tr = $('#track');
  function step(dir) { var c = $('.cl', tr); tr.scrollBy({ left: dir * (c.offsetWidth + 19), behavior: 'smooth' }); }
  $('#prev').onclick = function () { step(-1); }; $('#next').onclick = function () { step(1); };
  var lb = $('#lb'), lbi = $('img', lb);
  $$('.zoom').forEach(function (b) { b.onclick = function () { lbi.src = b.dataset.full; openDlg(lb); }; });
  lb.addEventListener('click', function () { closeDlg(lb); });
  $('.lbx', lb).onclick = function (e) { e.stopPropagation(); closeDlg(lb); };
  /* ---------- 10. Modo oscuro (preferencia guardada + tema del sistema) ---------- */
  (function () {
    var btn = $('#theme'); if (!btn) return;
    var KEY = 'fjx-theme', meta = $('meta[name="theme-color"]'), mq = matchMedia('(prefers-color-scheme:dark)'), tm;
    function stored() { try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; } }
    function apply(t, animate) {
      if (animate && !reduce) { root.classList.add('theme-t'); clearTimeout(tm); tm = setTimeout(function () { root.classList.remove('theme-t'); }, 450); }
      root.setAttribute('data-theme', t);
      var dark = t === 'dark';
      btn.setAttribute('aria-checked', dark);
      btn.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      if (meta) meta.setAttribute('content', dark ? '#0e0a1d' : '#5b21b6');
    }
    apply(root.getAttribute('data-theme') || stored() || (mq.matches ? 'dark' : 'light'));
    btn.addEventListener('click', function () {
      var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(t, true);
      try { localStorage.setItem(KEY, t); } catch (e) {}
    });
    /* mientras la persona no elija, se sigue el tema del sistema */
    function onSys(e) { if (!stored()) apply(e.matches ? 'dark' : 'light', true); }
    if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
  })();

  /* ---------- 11. Barra inferior móvil: resalta la sección visible ---------- */
  (function () {
    var items = $$('.bbar a[data-bb]'); if (!items.length) return;
    var secs = items.map(function (a) { return $('#' + a.dataset.bb); }), tick = false;
    function upd() { tick = false; var y = window.scrollY + window.innerHeight * 0.4;
      items.forEach(function (a, i) { var s = secs[i]; a.classList.toggle('on', !!s && y >= s.offsetTop && y < s.offsetTop + s.offsetHeight); }); }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  })();
})();
