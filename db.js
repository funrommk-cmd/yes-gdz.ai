// db.js
import { supabase } from './auth.js';

export async function saveTeacherRules(subject, rulesText) {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            alert('Помилка: користувач не авторизований!');
            window.location.href = 'index.html';
            return;
        }

        const { error } = await supabase
            .from('teacher_rules')
            .upsert({ 
                user_id: user.id, 
                subject: subject, 
                rules: rulesText 
            }, { onConflict: 'user_id,subject' });

        if (error) {
            alert('Не вдалося зберегти вимоги: ' + error.message);
        } else {
            alert('Вимоги вчителя успішно збережено!');
        }
    } catch (err) {
        alert('Помилка з\'єднання з базою даних.');
    }
}

export async function loadTeacherRules(subject) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return '';

        const { data, error } = await supabase
            .from('teacher_rules')
            .select('rules')
            .eq('user_id', user.id)
            .eq('subject', subject)
            .maybeSingle();

        if (error) return '';
        return data ? data.rules : '';
    } catch (err) {
        return '';
    }
}
