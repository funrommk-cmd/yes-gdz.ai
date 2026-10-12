// db.js

// Сохраняем требования учителя в память телефона
export async function saveTeacherRules(subject, rulesText) {
    try {
        localStorage.setItem(`rules_${subject}`, rulesText);
        alert('Вимоги вчителя успішно збережено на вашому пристрої!');
    } catch (err) {
        alert('Помилка при збереженні вимог.');
    }
}

// Загружаем требования из памяти телефона
export async function loadTeacherRules(subject) {
    return localStorage.getItem(`rules_${subject}`) || '';
}
