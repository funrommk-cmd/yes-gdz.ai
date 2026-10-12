// api/ask-ai.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const { userTask, teacherRules, subjectName, image } = req.body;

    if (!userTask && !image) {
        return res.status(400).json({ error: 'Не передано условие задачи или изображение.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'На сервере Vercel не настроен GEMINI_API_KEY.' });
        }

        const systemInstruction = `Ты — профессиональный ИИ-репетитор для украинских школ НУШ. 
твоя задача — идеально решить домашнее задание по предмету: ${subjectName}.
Отвечай СТРОГО на украинском языке.
КРИТИЧЕСКИ ВАЖНОЕ ТРЕБОВАНИЕ: Оформи решение с точным соблюдением правил и капризов этого учителя: "${teacherRules}". Если учитель требует определенные ключевые слова (например, "Дано", "Розв'язання"), используй их. Расписывай шаги максимально понятно.`;

        const contentsParts = [];

        if (image) {
            contentsParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                }
            });
        }

        const textPrompt = userTask 
            ? `Изучи изображение (если есть) и реши следующее задание: ${userTask}` 
            : `Изучи изображение и реши задачу, которую ты на нем видишь, соблюдая требования учителя.`;
            
        contentsParts.push({ text: textPrompt });

        const response = await fetch(`https://googleapis.com{apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: contentsParts }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiAnswer) {
            return res.status(500).json({ error: 'Нейросеть вернула пустой ответ.' });
        }

        return res.status(200).json({ answer: aiAnswer });

    } catch (error) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
    }
}
