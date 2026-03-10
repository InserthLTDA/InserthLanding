/* ══════════════════════════════════
   SCROLL — Animações avançadas + navegação
   GSAP + ScrollTrigger + contador + stagger
══════════════════════════════════ */

/* ── Scroll Progress Bar ── */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = (scrollTop / docHeight) * 100;
    progressBar.style.width = pct + '%';
}, { passive: true });

/* ── Counter Animation ── */
function animateCounter(el, target, suffix, duration) {
    const start    = performance.now();
    const isFloat  = String(target).includes('.');
    const decimals = isFloat ? 1 : 0;

    function update(now) {
        const elapsed = now - start;
        const t       = Math.min(elapsed / duration, 1);
        const ease    = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const current = ease * target;

        el.textContent = current.toFixed(decimals) + suffix;

        if (t < 1) requestAnimationFrame(update);
        else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(update);
}

/**
 * Inicializa animações de scroll com GSAP.
 * Chamado após o preloader terminar.
 */
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    /* Inicializa canvas de bolinhas da seção OPER */
    initOperDots();

    const nav = document.getElementById('nav');

    /* ── Troca de tema da navbar ── */
    document.querySelectorAll('.section-white').forEach(sec => {
        ScrollTrigger.create({
            trigger: sec,
            start:   'top top',
            end:     'bottom top',
            onEnter:      () => nav.classList.add('light'),
            onLeave:      () => nav.classList.remove('light'),
            onEnterBack:  () => nav.classList.add('light'),
            onLeaveBack:  () => nav.classList.remove('light'),
        });
    });

    /* ────────────────────────────────
       REVEAL ANIMATIONS — suaves, Apple-grade
       Sem filter:blur (GPU-intensivo em mobile)
    ──────────────────────────────── */
    const revealConfig = [
        {
            selector: '.reveal:not(.about-quote)',
            from:     { opacity: 0, y: 32 },
            defaults: { duration: 1.0, ease: 'power4.out' }
        },
        {
            selector: '.reveal-left',
            from:     { opacity: 0, x: -36 },
            defaults: { duration: 0.95, ease: 'power3.out' }
        },
        {
            selector: '.reveal-right',
            from:     { opacity: 0, x: 36 },
            defaults: { duration: 0.95, ease: 'power3.out' }
        },
        {
            selector: '.reveal-scale',
            from:     { opacity: 0, scale: 0.92, y: 20 },
            defaults: { duration: 0.85, ease: 'power3.out' }
        },
        {
            selector: '.about-quote.reveal',
            from:     { opacity: 0, x: -24 },
            defaults: { duration: 0.90, ease: 'power3.out' }
        },
    ];

    revealConfig.forEach(({ selector, from, defaults }) => {
        gsap.utils.toArray(selector).forEach(el => {
            gsap.fromTo(el, from, {
                ...defaults,
                opacity: 1,
                x: 0, y: 0,
                scale: 1,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
            });
        });
    });

    /* ────────────────────────────────
       BENTO GRID: stagger reveal
    ──────────────────────────────── */
    gsap.fromTo('.bento-card',
        { opacity: 0, y: 28 },
        {
            opacity: 1, y: 0,
            stagger: { each: 0.08, from: 'start' },
            duration: 0.70,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.product-bento',
                start: 'top 86%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* Mouse-follow spotlight nos cards do bento */
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
        });
    });

    /* ────────────────────────────────
       PRODUCT SUBTITLE + DESC: revelação em cascata
    ──────────────────────────────── */
    gsap.fromTo(['.product-tagline', '.product-hero-desc'],
        { opacity: 0, y: 16 },
        {
            opacity: 1, y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.product-hero',
                start: 'top 78%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       STAGGER: Stat Cards (Sobre)
    ──────────────────────────────── */
    gsap.fromTo('.about-stats .stat-card',
        { opacity: 0, y: 28 },
        {
            opacity: 1, y: 0,
            duration: 0.75,
            stagger: 0.10,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-stats',
                start: 'top 86%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       STAGGER: Niche Cards
    ──────────────────────────────── */
    gsap.fromTo('.niche-card',
        { opacity: 0, y: 24 },
        {
            opacity: 1, y: 0,
            duration: 0.65,
            stagger: { each: 0.07, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.niches-grid',
                start: 'top 86%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* Mouse-follow spotlight nos niche cards */
    document.querySelectorAll('.niche-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
        });
    });

    /* Mouse-follow spotlight nos pricing cards */
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
        });
    });

    /* ────────────────────────────────
       STAGGER: Advantage Cards (Mercado)
    ──────────────────────────────── */
    gsap.fromTo('.advantage-card',
        { opacity: 0, y: 24 },
        {
            opacity: 1, y: 0,
            duration: 0.65,
            stagger: { each: 0.09, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.advantages-grid',
                start: 'top 86%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       STAGGER: Pricing Cards — clean reveal
    ──────────────────────────────── */
    gsap.fromTo('.pricing-card',
        { opacity: 0, y: 36, scale: 0.97 },
        {
            opacity: 1, y: 0, scale: 1,
            duration: 0.75,
            stagger: { each: 0.12, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.pricing-grid',
                start: 'top 84%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* Pricing bg glow — expand on enter */
    gsap.fromTo('.pricing-bg-glow',
        { scale: 0.6, opacity: 0 },
        {
            scale: 1, opacity: 1,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.pricing',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       COUNTER: Market Numbers
    ──────────────────────────────── */
    const counterEls = document.querySelectorAll('.market-stat .stat-value[data-target]');
    if (counterEls.length) {
        ScrollTrigger.create({
            trigger: '.market-numbers',
            start: 'top 80%',
            once: true,
            onEnter: () => {
                counterEls.forEach(el => {
                    const target = parseFloat(el.dataset.target);
                    const suffix = el.dataset.suffix || '';
                    animateCounter(el, target, suffix, 1800);
                });
            },
        });
    }

    /* ────────────────────────────────
       SECTION LABEL: micro-reveal com delay
    ──────────────────────────────── */
    gsap.utils.toArray('.section-label').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, x: -12 },
            {
                opacity: 1, x: 0,
                duration: 0.70,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });

    /* ────────────────────────────────
       PARALLAX: Hero title gentle drift
    ──────────────────────────────── */
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            y: -48,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 2.5,
            },
        });
    }

    /* ────────────────────────────────
       PARALLAX: Globe — drift mais lento
    ──────────────────────────────── */
    const heroGlobe = document.getElementById('hero-globe');
    if (heroGlobe) {
        gsap.to(heroGlobe, {
            y: 70,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 3,
            },
        });
    }

    /* ────────────────────────────────
       MARKET NUMBERS: stagger limpo
    ──────────────────────────────── */
    gsap.fromTo('.market-stat',
        { opacity: 0, y: 20 },
        {
            opacity: 1, y: 0,
            duration: 0.60,
            stagger: { each: 0.08, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.market-numbers',
                start: 'top 86%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       FOOTER: revelação elegante
    ──────────────────────────────── */
    gsap.fromTo('.footer-brand',
        { opacity: 0, x: -24 },
        {
            opacity: 1, x: 0,
            duration: 0.90,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
        }
    );

    gsap.fromTo('.footer-nav-col',
        { opacity: 0, y: 16 },
        {
            opacity: 1, y: 0,
            duration: 0.70,
            stagger: 0.10,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.footer-nav',
                start: 'top 92%',
                toggleActions: 'play none none none',
            },
        }
    );

    gsap.fromTo('.footer-bottom',
        { opacity: 0 },
        {
            opacity: 1,
            duration: 1.0,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.footer-divider',
                start: 'top 92%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       CTA GLOW: expansão suave
    ──────────────────────────────── */
    gsap.fromTo('.cta-glow',
        { scale: 0.5, opacity: 0 },
        {
            scale: 1, opacity: 1,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.cta',
                start: 'top 78%',
                toggleActions: 'play none none none',
            },
        }
    );

    /* ────────────────────────────────
       PRODUCT NAME: entrada per-letra com stagger
    ──────────────────────────────── */
    initOperText();

    const operLetters = gsap.utils.toArray('.oper-letter');
    if (operLetters.length) {
        /* Entrada limpa: letras sobem juntas com leve stagger */
        gsap.fromTo(operLetters,
            { opacity: 0, y: 28 },
            {
                opacity: 1, y: 0,
                stagger: 0.055,
                duration: 0.72,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.product-hero',
                    start: 'top 82%',
                    toggleActions: 'play none none none',
                },
            }
        );
    } else {
        gsap.fromTo('.product-name',
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.product-hero',
                    start: 'top 84%',
                    toggleActions: 'play none none none',
                },
            }
        );
    }

    /* ────────────────────────────────
       PARALLAX: OPER glow move suave
    ──────────────────────────────── */
    gsap.to('.product-bg-glow', {
        y: -90,
        ease: 'none',
        scrollTrigger: {
            trigger: '.product',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
        },
    });

    /* ────────────────────────────────
       SECTION HEADINGS: fade global
    ──────────────────────────────── */
    gsap.utils.toArray('.section-heading').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });
}

/* ══════════════════════════════════
   OPER TEXT — 3D tilt + shimmer no hover
   Separa "OPER" em spans individuais.
   Chamado antes das animações GSAP para
   que os .oper-letter já existam no DOM.
══════════════════════════════════ */
function initOperText() {
    const productName = document.querySelector('.product-name');
    if (!productName) return;

    /* Split em spans por letra */
    const text = productName.textContent.trim();
    productName.innerHTML = text.split('').map((ch, i) =>
        `<span class="oper-letter" data-i="${i}">${ch}</span>`
    ).join('');

    /* ── Hover: brightness sweep per-letter ── */
    const letters = [...productName.querySelectorAll('.oper-letter')];
    if (letters.length) {
        productName.addEventListener('mouseenter', () => {
            gsap.timeline()
                .to(letters, {
                    filter: 'brightness(3)',
                    stagger: { each: 0.07, from: 'start' },
                    duration: 0.14,
                    ease: 'power2.in',
                    overwrite: 'auto',
                })
                .to(letters, {
                    filter: 'brightness(1)',
                    stagger: { each: 0.07, from: 'start' },
                    duration: 0.22,
                    ease: 'power2.out',
                }, '-=0.24');
        });
    }

    /* ── Mouse move na seção: tilt 3D ── */
    const section = document.querySelector('.product');
    if (!section) return;

    section.addEventListener('mousemove', e => {
        const rect = productName.getBoundingClientRect();
        if (e.clientY > rect.bottom + 280 || e.clientY < rect.top - 280) return;

        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const ry =  (e.clientX - cx) / 20;
        const rx = -(e.clientY - cy) / 28;

        gsap.to(productName, {
            rotationX: rx,
            rotationY: ry,
            transformPerspective: 900,
            duration: 0.45,
            ease: 'power2.out',
        });
    });

    section.addEventListener('mouseleave', () => {
        gsap.to(productName, {
            rotationX: 0,
            rotationY: 0,
            transformPerspective: 900,
            duration: 1.4,
            ease: 'elastic.out(1, 0.55)',
        });
    });
}

/* ══════════════════════════════════
   OPER DOTS — Canvas de bolinhas interativas
   Reage à posição do mouse (repulsão suave).
   Desabilitado em mobile para performance.
══════════════════════════════════ */
function initOperDots() {
    const canvas  = document.getElementById('oper-dots-canvas');
    if (!canvas) return;

    /* Desabilita canvas em mobile — muito pesado */
    if (window.innerWidth < 768) {
        canvas.style.display = 'none';
        return;
    }

    const ctx     = canvas.getContext('2d');
    const section = document.querySelector('.product');
    let   mouse   = { x: -9999, y: -9999 };
    let   dots    = [];
    let   raf     = null;

    /* ── Redimensiona canvas para preencher a seção ── */
    function resize() {
        canvas.width  = section.offsetWidth;
        /* cap at viewport height — ScrollTrigger inflates offsetHeight when pinning */
        canvas.height = Math.min(section.offsetHeight, window.innerHeight);
    }

    /* ── Quantidade ideal de pontos baseada na área ── */
    function dotCount() {
        return Math.min(Math.floor((canvas.width * canvas.height) / 13000), 90);
    }

    /* ── Cria pontos com variação orgânica ── */
    function createDots() {
        const n = dotCount();
        dots = [];
        for (let i = 0; i < n; i++) {
            const isFocal  = Math.random() < 0.10;   /* 10% maiores e mais visíveis */
            const isAccent = Math.random() < 0.05;   /* 5% verde (accent) */
            dots.push({
                x:  Math.random() * canvas.width,
                y:  Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.38,
                vy: (Math.random() - 0.5) * 0.38,
                r:  isFocal ? 1.6 + Math.random() * 1.4 : 0.4 + Math.random() * 1.4,
                o:  isFocal ? 0.22 + Math.random() * 0.22 : 0.06 + Math.random() * 0.20,
                isAccent,
            });
        }
    }

    /* ── Loop de renderização ── */
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dots.forEach(d => {
            /* Repulsão pelo mouse */
            const dx   = d.x - mouse.x;
            const dy   = d.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const R    = 125;
            if (dist < R && dist > 0) {
                const f = ((R - dist) / R) * 0.72;
                d.vx += (dx / dist) * f;
                d.vy += (dy / dist) * f;
            }

            /* Atrito + movimento */
            d.vx *= 0.968;
            d.vy *= 0.968;
            d.x  += d.vx;
            d.y  += d.vy;

            /* Rebote nas bordas */
            if (d.x < 0)             { d.x = 0;             d.vx =  Math.abs(d.vx); }
            if (d.x > canvas.width)  { d.x = canvas.width;  d.vx = -Math.abs(d.vx); }
            if (d.y < 0)             { d.y = 0;             d.vy =  Math.abs(d.vy); }
            if (d.y > canvas.height) { d.y = canvas.height; d.vy = -Math.abs(d.vy); }

            /* Pinta ponto — escuro sobre fundo branco */
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = d.isAccent
                ? `rgba(48,209,88,${d.o})`
                : `rgba(0,0,0,${d.o * 0.55})`;
            ctx.fill();
        });

        raf = requestAnimationFrame(draw);
    }

    /* ── Pause/resume com IntersectionObserver ── */
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!raf) draw();
            } else {
                cancelAnimationFrame(raf);
                raf = null;
            }
        });
    }, { threshold: 0.01 });
    observer.observe(section);

    /* ── Rastreia mouse relativo à seção ── */
    section.addEventListener('mousemove', e => {
        const rect = section.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    window.addEventListener('resize', () => { resize(); createDots(); });

    resize();
    createDots();
    draw();
}

/* ══════════════════════════════════
   SMOOTH SCROLL — Âncoras internas
══════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
