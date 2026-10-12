// api/ask-ai.js

export default async function handler(req, res) {
    // Разрешаем только POST запросы с фронтенда
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const { userTask, teacherRules, subjectName, image } = req.body;

    // Защитная проверка: ИИ должен получить либо фото, либо текст задачи
    if (!userTask && !image) {
        return res.status(400).json({ error: 'Не передано условие задачи или изображение.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'На сервере Vercel не настроен GEMINI_API_KEY.' });
        }

        // Базовый системный промпт, обучающий ИИ быть репетитором НУШ и слушать учителя
        const systemInstruction = `Ты — профессиональный ИИ-репетитор для украинских школ, работающий строго по государственным стандартам НУШ (Нова Українська Школа). 
твоя задача — идеально решить домашнее задание по предмету: ${subjectName}.
Отвечай СТРОГО на украинском языке, используя правильную научную и математическую терминологию.

КРИТИЧЕСКИ ВАЖНОЕ ТРЕБОВАНИЕ К ОФОРМЛЕНИЮ:
Тебе переданы конкретные капризы и требования учителя к этой работе: "${teacherRules}". 
Оформи решение с точным соблюдением этих правил! Если учитель требует определенные ключевые слова (например, "Дано", "Знайти", "Розв'язання"), используй их. Если учитель запрещает какой-то метод решения (например, запрещает дискриминант или требует решать задачи по геометрии только через векторы) — строго подчиняйся и ищи альтернативный метод. Расписывай шаги понятно, чтобы ребенок мог защитить работу.`;

        // Формируем массив частей (parts) для Gemini API
        const contentsParts = [];

        // 1. Если фронтенд передал фотографию, оборачиваем её в структуру InlineData для Gemini
        if (image) {
            contentsParts.push({
                inlineData: {
                    mimeType: "image/jpeg", // Подходит для большинства мобильных фото и скриншотов
                    data: image // Сама строка Base64, очищенная от заголовков на фронтенде
                }
            });
        }

        // 2. Добавляем текстовое задание (оно может быть пустым, если прислали только фото)
        const textPrompt = userTask 
            ? `Изучи изображение (если есть) и реши следующее задание: ${userTask}` 
            : `Изучи изображение и реши задачу, которую ты на нем видишь, соблюдая все требования учителя по оформлению.`;
            
        contentsParts.push({ text: textPrompt });

        // Выполняем официальный запрос к мультимодальному эндпоинту Google Gemini 1.5 Flash
        const response = await fetch(`https://googleapis.com{apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: contentsParts
                }],
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    temperature: 0.3, // Низкая температура для максимальной точности в точных науках
                    maxOutputTokens: 2048
                }
            })
        });

        const data = await response.json();

        // Проверяем, не вернул ли Google внутреннюю ошибку лимитов или ключа
        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(500).json({ error: data.error.message || 'Ошибка на стороне Google AI Studio.' });
        }

        // Безопасно извлекаем сгенерированный текст решения из ответа
        const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiAnswer) {
            return res.status(500).json({ error: 'Нейросеть вернула пустой ответ. Возможно, изображение размыто.' });
        }

        // Возвращаем идеальное решение на фронтенд нашего сайта
        return res.status(200).json({ answer: aiAnswer });

    } catch (error) {
        console.error('Vercel Serverless Function Error:', error);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера при обработке запроса.' });
    }
}
