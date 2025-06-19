// redactor-articulos.js (VERSIÓN CONECTADA)
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const outputWrapper = document.getElementById('generated-content-wrapper');

    // Función para construir el prompt detallado a partir de la configuración
    function constructPrompt(settings) {
        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold'
        ];
        const includedElements = toggles
            .filter(t => settings[t])
            .map(t => form.querySelector(`label[for="${t}"]`).textContent)
            .join(', ');
        
        const readabilityText = form.querySelector('#readability option:checked').textContent;
        const targetCountryText = form.querySelector('#target-country option:checked').textContent;

        // Construimos un prompt muy específico para la IA
        let prompt = `Actúa como un experto en redacción SEO y copywriting. Tu tarea es generar un artículo de alta calidad siguiendo estrictamente las siguientes instrucciones. El formato de salida debe ser Markdown.\n\n`;
        
        prompt += `1.  **Título Principal (H1):** "${settings['article-title']}"\n`;
        prompt += `2.  **Palabras Clave a Integrar:** ${settings['keywords']}\n`;
        prompt += `3.  **Tipo de Artículo:** ${settings['article-type']}\n`;
        prompt += `4.  **Público Objetivo:** Dirige el texto a: ${settings['target-audience']}\n`;
        prompt += `5.  **Idioma:** ${settings['language']}\n`;
        prompt += `6.  **País de Enfoque:** ${targetCountryText}\n`;
        prompt += `7.  **Tono de Voz:** ${settings['tone-of-voice']}\n`;
        prompt += `8.  **Punto de Vista:** ${settings['point-of-view']}\n`;
        prompt += `9.  **Nivel de Legibilidad:** ${readabilityText}\n`;
        prompt += `10. **Tamaño del Artículo:** ${settings['article-size']} (aproximadamente).\n\n`;

        prompt += `11. **Estructura y Formato:**\n`;
        prompt += `    - **Gancho de Introducción:** Usa un gancho de tipo "${settings['intro-hook']}". Si he proporcionado detalles adicionales, úsalos: "${settings['intro-details']}".\n`;
        prompt += `    - **Elementos a Incluir OBLIGATORIAMENTE en la estructura:** ${includedElements}.\n`;
        prompt += `    - Si "Conexión Web" está activado (${settings['web-access']}), busca información actualizada y relevante sobre el tema para enriquecer el contenido.\n\n`;

        prompt += `Ahora, por favor, genera el artículo completo en formato Markdown.`;

        return prompt;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const settings = Object.fromEntries(formData.entries());

        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold', 'web-access'
        ];
        toggles.forEach(toggle => {
            settings[toggle] = formData.has(toggle);
        });
        
        const detailedPrompt = constructPrompt(settings);
        console.log('Prompt enviado al backend:', detailedPrompt);

        // --- LLAMADA REAL A LA API ---
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
        outputContainer.innerHTML = `<div class="thinking-animation"><p>Enviando instrucciones al modelo... Esto puede tardar un momento.</p></div>`;
        outputWrapper.style.display = 'block';
        
        try {
            const response = await fetch('/api/generate-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: detailedPrompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'La respuesta del servidor no fue exitosa.');
            }

            const data = await response.json();
            
            // Usamos 'marked' para convertir la respuesta Markdown a HTML
            outputContainer.innerHTML = marked.parse(data.generatedText);

        } catch (error) {
            console.error('Error en el frontend:', error);
            outputContainer.innerHTML = `<p class="placeholder-text" style="color: #ff9ba1;">Error: ${error.message}. Revisa la consola para más detalles.</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Generar de Nuevo
            `;
        }
    });
});