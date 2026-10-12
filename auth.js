import { createClient } from 'https://esm.sh';

const SUPABASE_URL = 'https://wdprcqjuvnhkqyundrml.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pKSov1MDCIPyz4u6ctDH2w_cZN9ivi4';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Проверка авторизации при загрузке страниц
async function handleSession() {
    const { data: { user } } = await supabase.auth.getUser();
    const path = window.location.pathname;

    if (user && (path.includes('index.html') || path === '/')) {
        window.location.href = 'dashboard.html';
    } else if (!user && (path.includes('dashboard.html') || path.includes('subject.html'))) {
        window.location.href = 'index.html';
    }
}
window.addEventListener('DOMContentLoaded', handleSession);

// 1. Вход через Google
window.loginWithGoogle = async function() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard.html' }
    });
    if (error) alert('Помилка Google: ' + error.message);
}

// 2. Вход и регистрация по Email
window.registerWithEmail = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert('Заповніть пошту та пароль!');

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Успіх! Перевірте пошту для підтвердження акаунту.');
}

window.loginWithEmail = async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Помилка входу: ' + error.message);
    else window.location.href = 'dashboard.html';
}

// 3. Беспарольный вход по телефону (SMS)
window.sendSmsCode = async function() {
    const phone = document.getElementById('phone').value;
    if (!phone.startsWith('+380') || phone.length < 13) {
        return alert('Введіть коректний номер у форматі +380XXXXXXXXX');
    }

    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
        alert('Помилка надсилання SMS: ' + error.message);
    } else {
        document.getElementById('otpBlock').style.display = 'block';
        alert('Код надіслано на номер: ' + phone);
    }
}

window.verifySmsCode = async function() {
    const phone = document.getElementById('phone').value;
    const token = document.getElementById('otpCode').value;

    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) alert('Невірний код або термін дії вичерпано: ' + error.message);
    else window.location.href = 'dashboard.html';
}

// Выход из системы
window.logout = async function() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}
