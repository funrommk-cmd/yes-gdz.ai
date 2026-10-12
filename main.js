// main.js
import { saveTeacherRules, loadTeacherRules } from './db.js';

const urlParams = new URLSearchParams(window.location.search);
const currentSubject = urlParams.get('name') || 'general';

const subjectTitles = {
    algebra: 'Алгебра',
    geometry: 'Геометрія',
    physics: 'Фізика',
    chemistry: 'Хімія'
};

let uploadedImageBase64 = null;

async function initSubjectPage() {
    const titleLabel = document.getElementById('subjectTitle');
    const rulesTextarea = document.getElementById('teacherRules');

    if (titleLabel) titleLabel.innerText = subjectTitles[currentSubject] || currentSubject;
    if (rulesTextarea) {
        const savedRules = await loadTeacherRules(currentSubject);
        rulesTextarea.value = savedRules;
    }
}

window.saveCurrentRules = async function() {
    const rulesText = document.getElementById('teacherRules').value;
    await saveTeacherRules(currentSubject, rulesText);
}

window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('previewImage');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
        uploadedImageBase64 = e.target.result.split(',')[1]; // Берем чистый base64 код
    }
    reader.readAsDataURL(file);
}

window.clearImage = function() {
    uploadedImageBase64 = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
}

window.solveTaskWithGemini = async function() {
    const userTask = document.getElementById('userTask').value.trim();
    const teacherRules = document.getElementById('teacherRules').value.trim();
    const resultDiv = document.getElementById('aiResult');

    if (!userTask && !uploadedImageBase64) {
        return alert('Будь ласка, введіть текст або додайте фото завдання!');
    }

    resultDiv.innerHTML = `<span style="color: var(--accent);">⚡ yes-gdz.ai аналізує задачу та вимоги вчителя...</span>`;

    try {
        const response = await fetch('/api/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userTask: userTask,
                teacherRules: teacherRules,
                subjectName: subjectTitles[currentSubject] || currentSubject,
                image: uploadedImageBase64
            })
        });

        const data = await response.json();
        if (response.ok && data.answer) {
            resultDiv.innerText = data.answer;
        } else {
            resultDiv.innerText = `❌ Помилка: ${data.error || 'Невідома помилка сервера.'}`;
        }
    } catch (err) {
        resultDiv.innerText = '❌ Не вдалося з\'єднатися з сервером Vercel.';
    }
}

if (window.location.pathname.includes('subject.html')) {
    window.addEventListener('DOMContentLoaded', initSubjectPage);
}
