/* ══════════════════════════════════
   PRELOADER — Cubo 3D animado

   Tecnologias: Three.js + requestAnimationFrame
   (sem GSAP neste módulo — evita ticker freeze)

   Fases:
     loading   → cubo entra com elastic, barra avança
     exploding → cubo cresce exponencialmente e sai
     done      → cortina revela o conteúdo
══════════════════════════════════ */

(function () {
    /* ── Refs DOM (necessárias para o fallback) ── */
    const loaderContainerRef = document.getElementById('loader-container');
    const mainContentRef     = document.getElementById('main-content');

    /* ── Fallback rápido: se Three.js não carregar ou WebGL falhar ── */
    if (typeof THREE === 'undefined') {
        loaderContainerRef.style.display = 'none';
        mainContentRef.style.opacity       = '1';
        mainContentRef.style.pointerEvents = 'all';
        if (typeof initScrollAnimations === 'function') initScrollAnimations();
        return;
    }

    /* ── Three.js setup ── */
    const wrapper  = document.getElementById('canvas-wrapper');
    const W = window.innerWidth;
    const H = window.innerHeight;

    let scene, camera, renderer;
    try {
        scene    = new THREE.Scene();
        camera   = new THREE.OrthographicCamera(W / -2, W / 2, H / 2, H / -2, 1, 1000);
        camera.position.set(400, 400, 400);
        camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        wrapper.appendChild(renderer.domElement);
    } catch (e) {
        /* WebGL não disponível — mostra conteúdo imediatamente */
        loaderContainerRef.style.display = 'none';
        mainContentRef.style.opacity       = '1';
        mainContentRef.style.pointerEvents = 'all';
        if (typeof initScrollAnimations === 'function') initScrollAnimations();
        return;
    }

    /* ── Iluminação ── */
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.translateY(50);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(60, 100, 20);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0x8a8a8a, 1);
    backLight.position.set(-40, 100, 20);
    scene.add(backLight);

    /* ── Cubo ── */
    const group = new THREE.Group();
    scene.add(group);

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(60, 60, 60),
        new THREE.MeshPhongMaterial({ color: 0xf5f5f7, flatShading: true })
    );
    group.add(cube);

    /* ── Referências DOM ── */
    const barEl           = document.getElementById('bar');
    const pctEl           = document.getElementById('pct');
    const curtain         = document.getElementById('loader-curtain');
    const mainContent     = document.getElementById('main-content');
    const loaderContainer = document.getElementById('loader-container');
    const progressWrap    = document.getElementById('progress-wrap');

    /* ── Funções de easing ── */

    /**
     * Easing elástico de saída — entrada com bounce natural.
     * @param {number} t  - progresso 0..1
     * @param {number} amp    - amplitude do bounce
     * @param {number} period - período da oscilação
     */
    function elasticOut(t, amp, period) {
        if (t === 0 || t === 1) return t;
        const s = (period / (2 * Math.PI)) * Math.asin(1 / amp);
        return amp * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1;
    }

    /** Suaviza início e fim (aceleração e desaceleração). */
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /** Aceleração exponencial — usada na explosão do cubo. */
    function easeExpoIn(t) {
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }

    /* ── Timings (ms) ── */
    const ENTRY_DELAY  = 200;
    const ENTRY_DUR    = 1400;   // duração da entrada elástica
    const PROG_DELAY   = 1200;   // fade-in da barra
    const PROG_START   = 1500;   // início da contagem %
    const PROG_DUR     = 2500;   // duração da contagem
    const TOTAL_LOAD   = PROG_START + PROG_DUR; // ~4000ms

    const EXPLODE_DUR  = 700;    // duração da explosão
    const CURTAIN_DUR  = 350;    // fade da cortina

    /* ── Estado ── */
    let startTime   = performance.now();
    let phase       = 'loading';  // loading | exploding | done
    let explodeStart = 0;
    let morphTime   = 0;

    /* ══════════════════
       LOOP PRINCIPAL
    ══════════════════ */
    function renderLoop(now) {
        if (phase === 'done') return;
        requestAnimationFrame(renderLoop);

        const elapsed = now - startTime;

        /* ── FASE: loading ── */
        if (phase === 'loading') {

            // 1. Entrada do cubo com easing elástico
            const entryT  = Math.max(0, Math.min(1, (elapsed - ENTRY_DELAY) / ENTRY_DUR));
            const entryS  = elasticOut(entryT, 1, 0.35);
            const entryR  = elasticOut(entryT, 1, 0.4);

            if (entryT < 1) {
                cube.scale.set(entryS, entryS, entryS);
                cube.rotation.x = Math.PI * 2 * (1 - entryR);
                cube.rotation.y = Math.PI * 2 * (1 - entryR);
                cube.rotation.z = Math.PI     * (1 - entryR);
            } else {
                // Loop de morph orgânico após a entrada
                morphTime += 0.016;
                const mt = morphTime;
                cube.scale.set(
                    1 + 0.4 * Math.sin(mt * 2.5),
                    1 + 0.3 * Math.sin(mt * 2.5 + 1.2),
                    1 + 0.4 * Math.sin(mt * 2.5 + 2.4)
                );
                cube.rotation.y += 0.012;
            }

            // 2. Barra de progresso
            progressWrap.style.opacity = Math.max(0, Math.min(1, (elapsed - PROG_DELAY) / 500));

            const progT   = Math.max(0, Math.min(1, (elapsed - PROG_START) / PROG_DUR));
            const progVal = Math.round(easeInOutQuad(progT) * 100);
            barEl.style.width     = progVal + '%';
            pctEl.textContent     = String(progVal).padStart(3, '0');

            // 3. Transição para explosão
            if (elapsed >= TOTAL_LOAD) {
                phase        = 'exploding';
                explodeStart = now;
                progressWrap.style.transition = 'opacity 0.3s, transform 0.3s';
                progressWrap.style.opacity    = '0';
                progressWrap.style.transform  = 'translateX(-50%) translateY(-8px)';
            }
        }

        /* ── FASE: exploding ── */
        if (phase === 'exploding') {
            const et       = Math.min(1, (now - explodeStart) / EXPLODE_DUR);
            const scaleVal = 1 + easeExpoIn(et) * 14;

            cube.scale.set(scaleVal, scaleVal, scaleVal);
            cube.rotation.y -= 0.15;

            if (et >= 1) {
                scene.remove(group);
                curtain.style.transition = `opacity ${CURTAIN_DUR}ms`;
                curtain.style.opacity    = '1';
                setTimeout(showMainContent, CURTAIN_DUR);
                phase = 'done';
            }
        }

        renderer.render(scene, camera);
    }

    requestAnimationFrame(renderLoop);

    /* ── Fallback: força o conteúdo após 8s caso o WebGL/Three.js trave ── */
    setTimeout(() => {
        if (phase !== 'done') {
            phase = 'done';
            loaderContainer.style.display = 'none';
            showMainContent();
        }
    }, 8000);

    /* ── Resize handler ── */
    window.addEventListener('resize', () => {
        if (phase !== 'done') {
            const nw = window.innerWidth;
            const nh = window.innerHeight;
            camera.left   =  nw / -2;
            camera.right  =  nw /  2;
            camera.top    =  nh /  2;
            camera.bottom =  nh / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        }
    });

    /* ══════════════════
       REVELAR CONTEÚDO
    ══════════════════ */
    function showMainContent() {
        loaderContainer.style.display = 'none';

        /* ── Seletores do hero em ordem de aparecimento ── */
        const heroEls = [
            '.hero-eyebrow-wrap',
            '.hero-title',
            '.hero-subtitle',
            '.hero-btn--primary',
            '.hero-btn--ghost',
        ];

        /* Congela hero elements em invisible ANTES de revelar o main-content
           (evita flash de conteúdo não-animado) */
        heroEls.forEach(sel => {
            const el = document.querySelector(sel);
            if (!el) return;
            gsap.set(el, { opacity: 0, y: 32, clipPath: 'inset(110% 0 0 0)' });
        });

        /* Agora revela o container */
        mainContent.style.pointerEvents = 'all';
        mainContent.style.opacity       = '1';

        /* ── Entrada: "rise from below" — sem blur, clipPath + y ── */
        heroEls.forEach((sel, i) => {
            const el = document.querySelector(sel);
            if (!el) return;
            gsap.to(el, {
                opacity:  1,
                y:        0,
                clipPath: 'inset(0% 0 0 0)',
                duration: 1.05,
                ease:     'expo.out',
                delay:    0.06 + i * 0.11,
            });
        });

        /* Carrega o globo após o preloader */
        loadGlobe();

        /* Inicializa scroll animations (GSAP ScrollTrigger) */
        initScrollAnimations();
    }

    /* ══════════════════
       GLOBO 3D (iframe)
    ══════════════════ */
    function loadGlobe() {
        const globeContainer = document.getElementById('hero-globe');
        const iframe         = document.createElement('iframe');

        // Globo embutido na própria pasta do projeto
        iframe.src   = 'assets/globe/globe.html';
        iframe.title = 'Globe decorativo';

        iframe.onload = function () {
            iframe.classList.add('loaded');

            // Desabilita toda interação dentro do iframe
            try {
                const iDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Oculta HUD e controles desnecessários
                const hud = iDoc.getElementById('hud');
                if (hud) hud.style.display = 'none';

                const controls = iDoc.querySelector('.controls');
                if (controls) controls.style.display = 'none';

                const logo = iDoc.querySelector('.logo-wrapper');
                if (logo) logo.style.display = 'none';

                // Bloqueia interação no body
                iDoc.body.style.pointerEvents = 'none';
                iDoc.body.style.touchAction   = 'none';
                iDoc.body.style.userSelect    = 'none';

                // Bloqueia no root React
                const root = iDoc.getElementById('root');
                if (root) {
                    root.style.pointerEvents = 'none';
                    root.style.touchAction   = 'none';
                }

                // Bloqueia em todos os canvas
                iDoc.querySelectorAll('canvas').forEach(c => {
                    c.style.pointerEvents = 'none';
                    c.style.touchAction   = 'none';
                });
            } catch (e) {
                // Cross-origin: pointer-events no CSS já protege
            }
        };

        globeContainer.appendChild(iframe);
    }

})();