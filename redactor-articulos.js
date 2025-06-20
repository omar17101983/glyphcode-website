<<<<<<< HEAD
// redactor-articulos.js (VERSIÓN FINAL CON PUBLICACIÓN REAL)

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos...
=======
// redactor-articulos.js (VERSIÓN FINAL COMPLETA)

document.addEventListener('DOMContentLoaded', () => {
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const outputWrapper = document.getElementById('generated-content-wrapper');
<<<<<<< HEAD
=======
    
    // --- REFERENCIAS A LOS BOTONES DE ACCIÓN ---
>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

<<<<<<< HEAD
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
            const response = await fetch('/api/publish-to-wp', {
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
            const response = await fetch(`/api/wp-settings?userId=${userId}`);
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
=======
    // --- FUNCIÓN PARA CONSTRUIR EL PROMPT ---
    function constructPrompt(settings) {
        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold', 'web-access', 'include-featured-image'
        ];
        const includedElements = toggles
            .filter(t => settings[t] && t !== 'include-featured-image')
            .map(t => form.querySelector(`label[for="${t}"]`).textContent)
            .join(', ');
        
        const readabilityText = form.querySelector('#readability option:checked')?.textContent || 'Normal';
        const targetCountryText = form.querySelector('#target-country option:checked')?.textContent || 'Global';

        let prompt = `Actúa como un experto en redacción SEO y copywriting. Tu tarea es generar un artículo de alta calidad siguiendo estrictamente las siguientes instrucciones. El formato de salida debe ser Markdown.\n\n`;
        prompt += `1. **Título Principal (H1):** "${settings['article-title']}"\n`;
        prompt += `2. **Palabras Clave a Integrar:** ${settings['keywords']}\n`;
        prompt += `3. **Tipo de Artículo:** ${settings['article-type']}\n`;
        prompt += `4. **Público Objetivo:** Dirige el texto a: ${settings['target-audience']}\n`;
        prompt += `5. **Idioma:** ${settings['language']}\n`;
        prompt += `6. **País de Enfoque:** ${targetCountryText}\n`;
        prompt += `7. **Tono de Voz:** ${settings['tone-of-voice']}\n`;
        prompt += `8. **Punto de Vista:** ${settings['point-of-view']}\n`;
        prompt += `9. **Nivel de Legibilidad:** ${readabilityText}\n`;
        prompt += `10. **Tamaño del Artículo:** ${settings['article-size']} (aproximadamente).\n\n`;
        prompt += `11. **Estructura y Formato:**\n`;
        prompt += ` - **Gancho de Introducción:** Usa un gancho de tipo "${settings['intro-hook']}".\n`;
        prompt += ` - **Elementos a Incluir OBLIGATORIAMENTE en la estructura:** ${includedElements}.\n`;
        prompt += ` - Si "Conexión Web" está activado (${settings['web-access']}), busca información actualizada y relevante sobre el tema para enriquecer el contenido.\n\n`;
        prompt += `12. **Instrucciones de Imágenes:**\n`;
        if (settings['include-featured-image']) {
            prompt += ` - **Imagen Destacada:** Inserta una imagen destacada al principio del artículo, justo después del título H1.\n`;
        }
        if (settings['image-quantity'] !== 'ninguna') {
            prompt += ` - **Imágenes en el Cuerpo:** Distribuye una cantidad ${settings['image-quantity']} de imágenes adicionales a lo largo del texto, en lugares que sean contextualmente relevantes y aporten valor.\n`;
        }
        prompt += ` - **IMPORTANTE:** Para CADA imagen (destacada y en el cuerpo), usa EXCLUSIVAMENTE el siguiente formato de placeholder en Markdown: \`[IMAGEN: Una descripción visual muy detallada de lo que la imagen debería mostrar, relacionada con el texto circundante.]\`\n\n`;
        prompt += `Ahora, por favor, genera el artículo completo en formato Markdown siguiendo todas estas reglas.`;
        return prompt;
    }

    // --- EVENTO SUBMIT DEL FORMULARIO ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
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
<<<<<<< HEAD
        try {
            const response = await fetch('/api/generate-article', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: detailedPrompt, userId, articleKeywords: settings.keywords, includeFeaturedImage: settings['include-featured-image'] }) });
=======
        
        try {
            // --- ESTE ES EL BLOQUE MODIFICADO ---
            const requestBody = {
                prompt: detailedPrompt,
                userId: userId,
                articleKeywords: settings.keywords, // Pasamos las keywords para dar contexto
                includeFeaturedImage: settings['include-featured-image'] // Pasamos si se quiere imagen destacada
            };
            
            const response = await fetch('/api/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody), // Enviamos el nuevo objeto con más datos
            });

>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
            const data = await response.json();
            if (!response.ok) {
<<<<<<< HEAD
                throw new Error(data.error || 'Error del servidor.');
            }
            outputContainer.innerHTML = data.articleHtml;
            actionsContainer.classList.remove('hidden');
            const canPublishToWp = await checkUserSettings(userId);
            if (canPublishToWp) {
                publishWpDraftBtn.disabled = false;
                publishWpPublicBtn.disabled = false;
=======
                if (response.status === 429) {
                    outputContainer.innerHTML = `<div class="limit-reached-message"><h3>Límite Alcanzado</h3><p>${data.error}</p><a href="/login-generador-ia.html#precios" class="btn btn-primary">Ver Planes</a></div>`;
                } else {
                    throw new Error(data.error || 'La respuesta del servidor no fue exitosa.');
                }
            } else {
                outputContainer.innerHTML = data.articleHtml;
                actionsContainer.classList.remove('hidden');
>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
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

<<<<<<< HEAD
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
=======
    // --- LÓGICA DE LOS BOTONES DE ACCIÓN (RESTAURADA) ---
    copyBtn.addEventListener('click', () => {
        // Creamos un elemento temporal para no copiar el texto de la etiqueta de "IMAGEN DESTACADA"
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = outputContainer.innerHTML;
        // Eliminamos la etiqueta si existe
        const featuredTag = tempDiv.querySelector('.featured-image::before');
        if (featuredTag) featuredTag.remove();
        
        navigator.clipboard.writeText(tempDiv.innerText).then(() => {
            const originalText = copyBtn.querySelector('span').textContent;
            copyBtn.querySelector('span').textContent = '¡Copiado!';
            setTimeout(() => { copyBtn.querySelector('span').textContent = originalText; }, 2000);
        }).catch(err => {
            console.error('Error al copiar texto: ', err);
            alert('No se pudo copiar el texto.');
        });
    });

    downloadHtmlBtn.addEventListener('click', () => {
        const articleHtml = outputContainer.innerHTML;
        const articleTitle = document.getElementById('article-title').value || 'articulo-generado';
        // Añadimos los estilos directamente al HTML para que se vean bien al abrirlo
        const fullHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${articleTitle}</title><style>
            body{font-family:sans-serif;line-height:1.6;max-width:800px;margin:2rem auto;padding:0 1rem;color:#333;}
            img{max-width:100%;height:auto;border-radius:8px;}
            figure{margin:2rem 0;padding:0;text-align:center;border:1px solid #ddd;border-radius:8px;overflow:hidden;}
            figcaption{padding:0.8rem;font-style:italic;font-size:0.9rem;color:#555;background-color:#f9f9f9;}
            .featured-image{border:2px solid #007bff;}
            .featured-image::before{content:'IMAGEN DESTACADA';display:block;background-color:#007bff;color:white;padding:5px;font-weight:bold;margin-bottom:10px;}
        </style></head><body>${articleHtml}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${articleTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    publishDraftBtn.addEventListener('click', () => {
        alert('Simulación: Enviando artículo a WordPress como borrador...\n(Esta es una función de demostración).');
    });

    publishPublicBtn.addEventListener('click', () => {
        alert('Simulación: ¡Publicando artículo en WordPress!\n(Esta es una función de demostración).');
    });
>>>>>>> b746c0ae2369a6d57bdcb0900e5ad39d844e0b35
});