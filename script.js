// script.js (VERSIÓN FINAL Y LIMPIA)
document.addEventListener('DOMContentLoaded', function () {
    const hamburgerButton = document.getElementById('hamburger-button');
    const mainNav = document.getElementById('main-nav');
    const searchToggleButton = document.getElementById('search-toggle-mobile');
    const header = document.getElementById('main-header');
    const body = document.body;

    if (hamburgerButton && mainNav) {
        hamburgerButton.addEventListener('click', () => {
            mainNav.classList.toggle('nav-active');
            hamburgerButton.classList.toggle('is-active');
            body.classList.toggle('no-scroll');
            if (header.classList.contains('search-active')) {
                header.classList.remove('search-active');
            }
        });
    }

    if (searchToggleButton && header) {
        searchToggleButton.addEventListener('click', () => {
            header.classList.toggle('search-active');
            if (mainNav.classList.contains('nav-active')) {
                mainNav.classList.remove('nav-active');
                hamburgerButton.classList.remove('is-active');
                body.classList.remove('no-scroll');
            }
        });
    }
});