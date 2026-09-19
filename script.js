(function () {
  'use strict';

  /* =========================================================
     تاريخ رحيلها — كريمة سليمان محمد هدهود
     29 مارس 2019م / 22 رجب 1440هـ
     ========================================================= */
  const DEATH_DATE = new Date(2019, 2, 29);  

  const isEnglish = document.documentElement.lang === 'en';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STRINGS = {
    ar: {
      yearsSubtitle: function (years) { return 'مرّت ' + years + ' سنوات، وما زال أثركِ فينا.'; },
      anniversaryToday: function (years) { return 'اليوم يصادف مرور ' + years + ' سنوات على رحيلها. رحمها الله.'; },
      anniversaryUpcoming: function (years, days) {
        return 'تحل الذكرى القادمة لرحيلها (' + years + ' سنوات) بعد ' + days + ' يومًا.';
      }
    },
    en: {
      yearsSubtitle: function (years) { return years + ' years have passed, and your imprint remains within us.'; },
      anniversaryToday: function (years) { return 'Today marks ' + years + ' years since she passed. May God have mercy on her.'; },
      anniversaryUpcoming: function (years, days) {
        return 'Her next anniversary (' + years + ' years) is in ' + days + ' days.';
      }
    }
  };

  const t = isEnglish ? STRINGS.en : STRINGS.ar;

  
  function getYearsSince(deathDate, today) {
    let years = today.getFullYear() - deathDate.getFullYear();
    const anniversaryThisYear = new Date(today.getFullYear(), deathDate.getMonth(), deathDate.getDate());
    if (today < anniversaryThisYear) years -= 1;
    return years;
  }

  function getNextAnniversary(deathDate, today) {
    let next = new Date(today.getFullYear(), deathDate.getMonth(), deathDate.getDate());
    if (next < today) {
      next = new Date(today.getFullYear() + 1, deathDate.getMonth(), deathDate.getDate());
    }
    return next;
  }

  function isAnniversaryToday(deathDate, today) {
    return today.getMonth() === deathDate.getMonth() && today.getDate() === deathDate.getDate();
  }

  function daysBetween(a, b) {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
  }

  function initYearsSection() {
    const today = new Date();
    const years = getYearsSince(DEATH_DATE, today);

    const valueEl = document.getElementById('yearsValue');
    const subtitleEl = document.getElementById('yearsSubtitle');
    if (!valueEl) return;

    subtitleEl.textContent = t.yearsSubtitle(years);

    if (reduceMotion) {
      valueEl.textContent = String(years);
      return;
    }

    const section = document.getElementById('years-since');
    let hasAnimated = false;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          animateCount(valueEl, years);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });

    if (section) observer.observe(section);
  }

  function animateCount(el, target) {
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);  
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  function initAnniversarySection() {
    const el = document.getElementById('anniversaryMessage');
    if (!el) return;

    const today = new Date();
    const years = getYearsSince(DEATH_DATE, today);

   if (isAnniversaryToday(DEATH_DATE, today)) {
      el.textContent = t.anniversaryToday(years);
      const section = document.getElementById('anniversary');
      if (section) section.classList.add('is-anniversary');
      return;
    }

    const next = getNextAnniversary(DEATH_DATE, today);
    const days = daysBetween(today, next);
    const upcomingYears = years + 1;

    el.textContent = t.anniversaryUpcoming(upcomingYears, days);
  }

  
  function initImageFallbacks() {
    const images = document.querySelectorAll('img.real-photo');
    images.forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('img-missing');
      }, { once: true });
    });
  }

  /* ---------- صندوق عرض الصور (Lightbox) ---------- */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    

    if (!lightbox) return;

    const frames = Array.prototype.slice.call(document.querySelectorAll('.photo-frame ,.legacy__photo-btn'));
    let currentIndex = 0;
    let lastFocusedElement = null;

    function openAt(index) {
      if (frames.length === 0) return;
      currentIndex = (index + frames.length) % frames.length;
      const frame = frames[currentIndex];
      const img = frame.querySelector('img');

      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || '';

      const captionText = img.alt || '';
      lightboxCaption.textContent = captionText;
      lightboxCaption.hidden = captionText.trim() === '';

      lastFocusedElement = document.activeElement;
      lightbox.hidden = false;
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    frames.forEach(function (frame, index) {
      frame.addEventListener('click', function () {
        const img = frame.querySelector('img');
        if (img.classList.contains('img-missing')) return;
        openAt(index);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { openAt(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { openAt(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      const isRTL = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowLeft') openAt(currentIndex + (isRTL ? 1 : -1));
      if (e.key === 'ArrowRight') openAt(currentIndex + (isRTL ? -1 : 1));
    });
  }

  
  function initPageFold() {
    const tl = document.querySelector('.page-fold--tl');
    const br = document.querySelector('.page-fold--br');
    if (!tl || !br) return;

    if (reduceMotion) return;  

    let ticking = false;

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

      const angle = progress * 10; 
      tl.style.transform = 'rotate(' + angle + 'deg) scale(' + (1 + progress * 0.15) + ')';
      br.style.transform = 'rotate(' + -angle + 'deg) scale(' + (1 + progress * 0.15) + ')';

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initYearsSection();
    initAnniversarySection();
    initImageFallbacks();
    initLightbox();
    initPageFold();
  });
})();