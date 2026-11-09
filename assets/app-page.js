// Shared behaviour for the Music 7 and UniUI app pages.
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal on scroll
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el, k) => { el.style.transitionDelay = (k % 4) * 60 + 'ms'; io.observe(el); });

    // Card spotlight
    document.querySelectorAll('.card').forEach(c => c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));

    // Active nav link
    const links = [...document.querySelectorAll('.topnav ul a')];
    const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    addEventListener('scroll', () => {
        let cur = null;
        secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s; });
        links.forEach(a => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
    }, { passive: true });

    // Swap a phone screen image with a short fade
    window.swapScreen = (img, src, alt) => {
        if (img.getAttribute('src') === src) return;
        img.classList.add('out');
        const pre = new Image();
        pre.onload = () => setTimeout(() => { img.src = src; img.alt = alt || ''; img.classList.remove('out'); }, reduce ? 0 : 180);
        pre.src = src;
    };

    // Theme switchers: buttons with data-src/data-title/data-desc inside [data-switcher]
    document.querySelectorAll('[data-switcher]').forEach(sw => {
        const img = sw.querySelector('.phone .screen img');
        const title = sw.querySelector('[data-title]'), desc = sw.querySelector('[data-desc]');
        const btns = [...sw.querySelectorAll('.chip[data-src]')];
        let k = 0, timer;
        const pick = (n, user) => {
            k = n; const b = btns[n];
            btns.forEach(x => x.classList.toggle('on', x === b));
            swapScreen(img, b.dataset.src, b.textContent.trim());
            if (title) title.textContent = b.dataset.name || b.textContent.trim();
            if (desc) desc.textContent = b.dataset.desc || '';
            if (user) clearInterval(timer);
        };
        btns.forEach((b, n) => b.addEventListener('click', () => pick(n, true)));
        pick(0);
        if (!reduce) {
            timer = setInterval(() => pick((k + 1) % btns.length), 3600);
            sw.addEventListener('pointerenter', () => clearInterval(timer), { once: true });
        }
    });

    // Gallery + lightbox
    document.querySelectorAll('[data-gallery]').forEach(wrap => {
        const strip = wrap.querySelector('.gallery');
        const items = [...strip.querySelectorAll('button')];
        wrap.querySelector('.g-prev')?.addEventListener('click', () => strip.scrollBy({ left: -strip.clientWidth * 0.8, behavior: 'smooth' }));
        wrap.querySelector('.g-next')?.addEventListener('click', () => strip.scrollBy({ left: strip.clientWidth * 0.8, behavior: 'smooth' }));
        const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
        let k = 0;
        const open = n => { k = (n + items.length) % items.length; const im = items[k].querySelector('img'); lbImg.src = im.dataset.full || im.src; lbImg.alt = im.alt; lb.classList.add('open'); lb.querySelector('.lb-close').focus(); };
        items.forEach((b, n) => b.addEventListener('click', () => { lb.dataset.owner = wrap.id; open(n); }));
        lb.querySelector('.lb-prev').addEventListener('click', () => lb.dataset.owner === wrap.id && open(k - 1));
        lb.querySelector('.lb-next').addEventListener('click', () => lb.dataset.owner === wrap.id && open(k + 1));
        addEventListener('keydown', e => {
            if (!lb.classList.contains('open') || lb.dataset.owner !== wrap.id) return;
            if (e.key === 'ArrowLeft') open(k - 1);
            if (e.key === 'ArrowRight') open(k + 1);
        });
    });
    const lb = document.getElementById('lightbox');
    if (lb) {
        const close = () => lb.classList.remove('open');
        lb.querySelector('.lb-close').addEventListener('click', close);
        lb.addEventListener('click', e => { if (e.target === lb) close(); });
        addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }

    // Count-up numbers
    const cio = new IntersectionObserver(entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, t0 = performance.now();
        const step = t => { const p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
        reduce ? (el.textContent = end) : requestAnimationFrame(step);
        cio.unobserve(el);
    }), { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
})();
