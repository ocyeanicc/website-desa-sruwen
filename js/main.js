/* JS PROFIL DESA*/

// Simple JS to support future enhancements. Currently no interactive widget required.
(function(){
  // For accessibility: add focus styles to nav links when keyboard used
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(a=>{
    a.addEventListener('focus', ()=> a.style.outline='2px dashed rgba(0,0,0,0.12)');
    a.addEventListener('blur',  ()=> a.style.outline='none');
  });
})();


/* JS INFOGRAFIS*/
// small interactions: focus outline for accessibility + optional toggles
(function(){
  document.querySelectorAll('nav a').forEach(function(a){
    a.addEventListener('focus', function(){ a.style.outline = '2px dashed rgba(0,0,0,0.12)'; });
    a.addEventListener('blur',  function(){ a.style.outline = 'none'; });
  });

  // if you later add .pill interactions
  document.querySelectorAll('.pill').forEach(function(p){
    p.style.cursor = 'pointer';
    p.addEventListener('click', function(){ p.classList.toggle('active'); });
  });
})();


/* JS LAYANAN*/
/* js/layanan.js
   Scoped JS untuk halaman layanan — hanya aktif ketika <body class="layanan-page">
*/
(function () {
  if (!document.body.classList.contains('layanan-page')) return; // safety: hanya jalankan di halaman layanan

  /* --- Utility: create ephemeral toast message --- */
  function showToast(message, timeout = 1800) {
    let toast = document.createElement('div');
    toast.className = 'layanan-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '22px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(42,30,30,0.9)',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '10px',
      zIndex: 9999,
      fontSize: '14px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity .28s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  }

  /* --- Accessible focus outlines for navbar (re-usable) --- */
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('focus', () => a.style.outline = '2px dashed rgba(0,0,0,0.12)');
    a.addEventListener('blur',  () => a.style.outline = 'none');
  });

  /* --- Email copy handler (col-right mailto) --- */
  (function setupEmailCopy() {
    const mailLink = document.querySelector('.layanan-area .col-right a[href^="mailto:"]');
    if (!mailLink) return;
    mailLink.addEventListener('click', function (e) {
      // prefer copying so user sees it even if mail client blocked
      e.preventDefault();
      const email = mailLink.getAttribute('href').replace('mailto:', '');
      if (!navigator.clipboard) {
        showToast(`Salin manual: ${email}`);
        return;
      }
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email "${email}" disalin ke clipboard`);
      }).catch(() => {
        showToast(`Gagal menyalin. Email: ${email}`);
      });
    });
    mailLink.setAttribute('role', 'button');
    mailLink.setAttribute('aria-label', 'Salin alamat email ke clipboard');
  })();

  /* --- Phone click handler: open tel: jika tersedia, else copy number --- */
  (function setupPhoneClick() {
    // phone element can be plain text inside .contact-item or similar
    const phoneEl = Array.from(document.querySelectorAll('.layanan-area .contact-item'))
      .find(el => /\d{6,}/.test(el.textContent)); // basic phone detection
    if (!phoneEl) return;

    // extract digits and plus sign
    const phoneText = phoneEl.textContent.trim();
    const phoneDigits = (phoneText.match(/[\+\d][\d\s\-\(\)]{5,}/) || [phoneText])[0].replace(/[^\d\+]/g, '');
    phoneEl.style.cursor = 'pointer';

    phoneEl.addEventListener('click', function (e) {
      // try open tel: (mobile/desktop apps) otherwise copy
      const telLink = `tel:${phoneDigits}`;
      // Best-effort feature detect: navigator.userAgent mobile or touch support
      const isMobileLike = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || ('ontouchstart' in window);
      if (isMobileLike) {
        // attempt to open tel:
        window.location.href = telLink;
        // fallback: still show toast
        showToast(`Membuka aplikasi telepon: ${phoneDigits}`);
      } else {
        // copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(phoneDigits).then(() => {
            showToast(`Nomor ${phoneDigits} disalin ke clipboard`);
          }).catch(() => {
            showToast(`Salin manual: ${phoneDigits}`);
          });
        } else {
          showToast(`Salin manual: ${phoneDigits}`);
        }
      }
    });

    // keyboard accessible
    phoneEl.setAttribute('tabindex', '0');
    phoneEl.setAttribute('role', 'button');
    phoneEl.addEventListener('keypress', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        phoneEl.click();
      }
    });
  })();

  /* --- Logo hover/focus behavior (add/remove class instead of inline styles) --- */
  (function setupLogoInteractions() {
    const logoImg = document.querySelector('.layanan-area .layanan-logo img');
    if (!logoImg) return;
    // ensure CSS has .logo-hover to apply transform; fallback to inline if needed
    logoImg.addEventListener('mouseenter', () => logoImg.classList.add('logo-hover'));
    logoImg.addEventListener('mouseleave', () => logoImg.classList.remove('logo-hover'));

    // keyboard users: focus/blur
    logoImg.setAttribute('tabindex', '0');
    logoImg.addEventListener('focus', () => logoImg.classList.add('logo-hover'));
    logoImg.addEventListener('blur',  () => logoImg.classList.remove('logo-hover'));
  })();

  /* --- Make .col cards keyboard-accessible and toggleable (aria-expanded) --- */
  (function setupColToggle() {
    const cols = document.querySelectorAll('.layanan-area .col');
    if (!cols || !cols.length) return;
    cols.forEach(col => {
      // if already interactive, skip (we only add minimal behavior)
      col.setAttribute('tabindex', col.getAttribute('tabindex') || '0');
      col.setAttribute('role', 'region');
      col.setAttribute('aria-label', col.querySelector('h3') ? col.querySelector('h3').textContent.trim() : 'Layanan item');
      col.setAttribute('aria-expanded', 'false');

      // toggle on Enter / Space / click
      function toggle() {
        const expanded = col.getAttribute('aria-expanded') === 'true';
        col.setAttribute('aria-expanded', String(!expanded));
        col.classList.toggle('active', !expanded);
      }

      col.addEventListener('click', function (e) {
        // avoid toggling if clicked on a link inside
        if (e.target.closest('a')) return;
        toggle();
      });

      col.addEventListener('keypress', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggle();
        }
      });
    });
  })();

  /* --- Defensive: remove any accidental global inline outlines left by other scripts --- */
  window.addEventListener('blur', () => {
    document.querySelectorAll('nav a').forEach(a => a.style.outline = '');
  });

  /* --- Optional: expose small debug helper on window for devs (non-enumerable) --- */
  Object.defineProperty(window, '__LAYANAN_HELPER__', {
    value: {
      showToast
    },
    writable: false,
    configurable: true,
    enumerable: false
  });
})();



/* JS HOME*/
// js/home.js
(function(){
  if(!document.body.classList.contains('home-page')) return;

  // Lightbox for gallery
  const gallery = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox ? lightbox.querySelector('.lb-img') : null;
  const lbClose = lightbox ? lightbox.querySelector('.lb-close') : null;

  function openLightbox(src, alt){
    if(!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    if(!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // attach click on gallery items
  document.querySelectorAll('.gallery-item img').forEach(img=>{
    img.style.cursor = 'pointer';
    img.addEventListener('click', ()=> openLightbox(img.src, img.alt));
  });

  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  if(lightbox){
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeLightbox();
    });
  }

  // optional: lazy load images using native loading="lazy"
  document.querySelectorAll('img').forEach(img=>{
    if(!img.getAttribute('loading')) img.setAttribute('loading','lazy');
  });

})();


/* JS POTENSI UMKM*/
(function(){
  // create modal element
  const modal = document.createElement('div');
  modal.className = 'ps-lightbox';
  modal.innerHTML = '<div class="ps-lightbox-inner" role="dialog" aria-modal="true" tabindex="-1"><button class="ps-close" aria-label="Tutup">&times;</button><img alt=""><figcaption></figcaption></div>';
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('img');
  const modalCaption = modal.querySelector('figcaption');
  const closeBtn = modal.querySelector('.ps-close');

  // open
  function open(src, alt, caption){
    modal.classList.add('open');
    modalImg.src = src;
    modalImg.alt = alt || '';
    modalCaption.textContent = caption || '';
    // focus for accessibility
    modal.querySelector('.ps-lightbox-inner').focus();
    document.body.style.overflow = 'hidden';
  }
  // close
  function close(){
    modal.classList.remove('open');
    modalImg.src = '';
    modalCaption.textContent = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function(e){
    if(e.target === modal) close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  // attach click handlers to gallery images
  document.querySelectorAll('.cards-grid .card img').forEach(img=>{
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(){
      // prefer data-large attribute if provided
      const large = img.getAttribute('data-large') || img.src;
      const alt = img.alt || '';
      const caption = img.closest('figure')?.querySelector('figcaption')?.innerText || '';
      open(large, alt, caption);
    });
  });

  // add minimal styles for lightbox dynamically (so user tak perlu edit CSS file)
  const style = document.createElement('style');
  style.textContent = `
    .ps-lightbox{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,6,6,0.75);z-index:9999}
    .ps-lightbox.open{display:flex}
    .ps-lightbox-inner{max-width:92vw;max-height:92vh;outline:none;position:relative;padding:12px;border-radius:8px;background:transparent;display:flex;flex-direction:column;align-items:center;gap:10px}
    .ps-lightbox-inner img{max-width:100%;max-height:80vh;border-radius:6px;box-shadow:0 12px 36px rgba(0,0,0,0.6)}
    .ps-lightbox-inner figcaption{color:#fff;opacity:0.95;text-align:center;max-width:90vw}
    .ps-close{position:absolute;right:6px;top:6px;background:rgba(255,255,255,0.14);border:none;color:#fff;font-size:26px;line-height:1;padding:6px 10px;border-radius:6px;cursor:pointer}
    .ps-close:hover{background:rgba(255,255,255,0.22)}
  `;
  document.head.appendChild(style);
})();