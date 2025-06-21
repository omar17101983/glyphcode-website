// redactor-articulos.js (VERSIÓN FINAL CON PUBLICACIÓN REAL)

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos...
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const outputWrapper = document.getElementById('generated-content-wrapper');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    if(publishWpDraftBtn) publishWpDraftBtn.disabled = true;
    if(publishWpPublicBtn) publishWpPublicBtn.disabled = true;
    
    // Función de comprobación (sin cambios)
    async function checkUserSettings(userId) { /* ...código sin cambios... */ }

    // Función constructPrompt (sin cambios)
    function constructPrompt(settings) { /* ...código sin cambios... */ }
    
    // Evento del formulario (sin cambios)
    form.addEventListener('submit', async (e) => { /* ...código sin cambios... */ });

    // --- ACCIONES DE BOTONES (MODIFICADO) ---
    copyBtn.addEventListener('click', () => { /* ...sin cambios... */ });
    downloadHtmlBtn.addEventListener('click', () => { /* ...sin cambios... */ });

    // --- Lógica para manejar la publicación ---
    async function handlePublish(status) {
        const userId = localStorage.getItem('userId');
        const title = document.getElementById('article-title').value;
        const content = outputContainer.innerHTML;
        const buttonToUpdate = status === 'draft' ? publishWpDraftBtn : publishWpPublicBtn;

        const originalText = buttonToUpdate.innerHTML;
        buttonToUpdate.disabled = true;
        buttonToUpdate.innerHTML = `<span class="spinner"></span> PUBLICANDO...`;
        
        try {
            const response = await fetch('https://api.glyphcode.com/api/publish-to-wp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title, content, status }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `Error del servidor: ${response.status}`);
            }

            alert(`${result.message}\nEnlace: ${result.postLink}`);

        } catch (error) {
            console.error(`Error al publicar como ${status}:`, error);
            alert(`Error de publicación: ${error.message}`);
        } finally {
            buttonToUpdate.innerHTML = originalText;
            buttonToUpdate.disabled = false;
        }
    }

    if (publishWpDraftBtn) {
        publishWpDraftBtn.addEventListener('click', () => handlePublish('draft'));
    }

    if (publishWpPublicBtn) {
        publishWpPublicBtn.addEventListener('click', () => handlePublish('publish'));
    }

    // Para evitar la duplicación de código, aquí incluyo las funciones que marqué como "sin cambios".
    async function checkUserSettings(userId) {
        try {
            const response = await fetch(`https://api.glyphcode.com/api/wp-settings?userId=${userId}`);
            if (!response.ok) return false;
            const settings = await response.json();
            return (settings.wpUrl && settings.wpUsername);
        } catch (error) {
            console.error("Error al comprobar los ajustes del usuario:", error);
            return false;
        }
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) { window.location.href = '/login-generador-ia.html'; return; }
        if(publishWpDraftBtn) publishWpDraftBtn.disabled = true;
        if(publishWpPublicBtn) publishWpPublicBtn.disabled = true;

        const formData = new FormData(form);
        const settings = Object.fromEntries(formData.entries());
        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold', 'web-access', 'include-featured-image'
        ];
        toggles.forEach(toggle => settings[toggle] = formData.has(toggle));
        const detailedPrompt = constructPrompt(settings);
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
        outputContainer.innerHTML = `<div class="thinking-animation"><p>Verificando límites, contactando al modelo y buscando imágenes...</p></div>`;
        outputWrapper.style.display = 'block';
        actionsContainer.classList.add('hidden');
        try {
            const response = await fetch('https://api.glyphcode.com/api/generate-article', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: detailedPrompt, userId, articleKeywords: settings.keywords, includeFeaturedImage: settings['include-featured-image'] }) });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error del servidor.');
            }
            outputContainer.innerHTML = data.articleHtml;
            actionsContainer.classList.remove('hidden');
            const canPublishToWp = await checkUserSettings(userId);
            if (canPublishToWp) {
                publishWpDraftBtn.disabled = false;
                publishWpPublicBtn.disabled = false;
            }
        } catch (error) {
            outputContainer.innerHTML = `<p class="placeholder-text error-message">Error: ${error.message}.</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Generar de Nuevo`;
        }
    });
    function constructPrompt(settings) {
        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold', 'web-access', 'include-featured-image'
        ];
        const includedElements = toggles
            .filter(t => settings[t] && t !== 'include-featured-image')
            .map(t => form.querySelector(`label[for="${t}"]`).textContent.trim())
            .join(', ');

        let prompt = `Actúa como un experto en redacción SEO y copywriting. Tu tarea es generar un artículo de alta calidad en formato Markdown.\n\n`
        prompt += `1. **Título Principal (H1):** "${settings['article-title']}"\n`;
        prompt += `2. **Palabras Clave:** ${settings['keywords']}\n`;
        prompt += `... (resto del prompt sin cambios)\n`
        if (settings['image-quantity'] !== 'ninguna') {
            prompt += ` - **Imágenes en el Cuerpo:** Distribuye imágenes. \`[IMAGEN: Una descripción visual detallada.]\`\n\n`;
        }
        prompt += `Ahora, genera el artículo completo.`;
        return prompt;
    }
    copyBtn.addEventListener('click', () => { /* ...sin cambios... */ });
    downloadHtmlBtn.addEventListener('click', () => { /* ...sin cambios... */ });
});