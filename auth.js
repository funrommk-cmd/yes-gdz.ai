// auth.js

// Функция быстрого входа без пароля
window.fastLogin = function() {
    localStorage.setItem('gdz_user_session', 'active');
    window.location.href = 'dashboard.html';
}

// Защита страниц: проверяем «вход» при загрузке
function checkLocalSession() {
    const session = localStorage.getItem('gdz_user_session');
    const path = window.location.pathname;

    if (session && (path.includes('index.html') || path === '/')) {
        window.location.href = 'dashboard.html';
    } else if (!session && (path.includes('dashboard.html') || path.includes('subject.html'))) {
        window.location.href = 'index.html';
    }
}

// Функция выхода
window.logout = function() {
    localStorage.removeItem('gdz_user_session');
    window.location.href = 'index.html';
}

window.addEventListener('DOMContentLoaded', checkLocalSession);
