/* ══════════════════════════════════
   MODAL — Lista de espera
   Funcional: valida, salva em localStorage,
   exibe estado de sucesso animado.
   Opcional: configure WAITLIST_ENDPOINT com
   sua URL Formspree/webhook para envio real.
══════════════════════════════════ */

(function () {
    /* ── Configuração ── */
    /* Para envio real de emails, crie uma conta gratuita em formspree.io
       e substitua pelo seu endpoint:
       const WAITLIST_ENDPOINT = 'https://formspree.io/f/SEU_ID_AQUI'; */
    const WAITLIST_ENDPOINT = 'https://formspree.io/f/myknwlyj';   // null = apenas localStorage

    /* ── Refs ── */
    const overlay    = document.getElementById('waitlist-modal');
    const form       = document.getElementById('waitlist-form');
    const successEl  = document.getElementById('modal-success');
    const closeBtn   = document.getElementById('modal-close');
    const submitBtn  = document.getElementById('modal-submit');
    const nameInput  = document.getElementById('modal-name');
    const emailInput = document.getElementById('modal-email');

    if (!overlay) return; // modal não encontrado no DOM

    /* ── Abrir / Fechar ── */
    function openModal() {
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => nameInput && nameInput.focus(), 350);
    }

    function closeModal() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        /* Reset do form após fechar */
        setTimeout(() => {
            if (form)      { form.reset(); form.style.display = ''; }
            if (successEl) { successEl.classList.remove('is-visible'); }
            if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('loading'); }
            clearErrors();
        }, 420);
    }

    /* ── Fechar com ESC ou clique no overlay ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });

    closeBtn  && closeBtn.addEventListener('click', closeModal);

    /* Botão fechar do success state */
    const successCloseBtn = document.getElementById('modal-success-close');
    successCloseBtn && successCloseBtn.addEventListener('click', closeModal);

    /* ── Triggers: qualquer botão "Lista de espera" ── */
    document.querySelectorAll('[data-modal="waitlist"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            openModal();
        });
    });

    /* ── Validação ── */
    function clearErrors() {
        [nameInput, emailInput].forEach(el => el && el.classList.remove('error'));
    }

    function isValidEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    }

    function validate() {
        let ok = true;
        clearErrors();
        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            nameInput.focus();
            ok = false;
        }
        if (!isValidEmail(emailInput.value)) {
            emailInput.classList.add('error');
            if (ok) emailInput.focus();
            ok = false;
        }
        return ok;
    }

    /* ── Submit ── */
    form && form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!validate()) return;

        const entry = {
            name:  nameInput.value.trim(),
            email: emailInput.value.trim(),
            date:  new Date().toISOString(),
        };

        /* Estado de carregamento */
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            /* Envio para endpoint externo (se configurado) */
            if (WAITLIST_ENDPOINT) {
                await fetch(WAITLIST_ENDPOINT, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body:    JSON.stringify(entry),
                });
            } else {
                /* Simula delay de rede para feedback visual */
                await new Promise(r => setTimeout(r, 800));
            }

            /* Salva em localStorage (persiste localmente em qualquer caso) */
            const prev = JSON.parse(localStorage.getItem('inserth_waitlist') || '[]');
            const alreadyIn = prev.some(e => e.email === entry.email);
            if (!alreadyIn) {
                prev.push(entry);
                localStorage.setItem('inserth_waitlist', JSON.stringify(prev));
            }

            /* Exibe sucesso */
            form.style.display = 'none';
            successEl.classList.add('is-visible');

        } catch (err) {
            /* Em caso de erro de rede, ainda salva local e mostra sucesso */
            const prev = JSON.parse(localStorage.getItem('inserth_waitlist') || '[]');
            prev.push(entry);
            localStorage.setItem('inserth_waitlist', JSON.stringify(prev));
            form.style.display = 'none';
            successEl.classList.add('is-visible');
        }
    });

})();
