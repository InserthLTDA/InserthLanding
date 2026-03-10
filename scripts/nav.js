/* ══════════════════════════════════
   NAV — Menu mobile toggle
══════════════════════════════════ */

document.getElementById('mobile-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('show');
});

/**
 * Fecha o menu mobile ao clicar em um link interno.
 * Chamado via onclick nos <a> do menu.
 */
function closeMenu() {
    document.getElementById('nav-links').classList.remove('show');
}
