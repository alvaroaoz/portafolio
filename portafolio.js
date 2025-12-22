// DOM Elements
const menuToggle = document.querySelector('.header__menu-toggle');
const menuList = document.querySelector('.header__menu-list');

// Toggle Mobile Menu
if (menuToggle && menuList) {
    menuToggle.addEventListener('click', () => {
        menuList.classList.toggle('open');
        
        // Toggle icon between bars and times (X)
        const icon = menuToggle.querySelector('i');
        if (menuList.classList.contains('open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });
}

// Simple Welcome Log
console.log(
    '%c ¡Bienvenido al Portafolio! ',
    'background: #222; color: #00e1f4; font-size: 20px; border-radius: 4px; padding: 4px;'
);