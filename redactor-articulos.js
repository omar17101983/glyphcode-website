// redactor-articulos.js (VERSIÓN CORREGIDA Y ORDENADA)

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const outputWrapper = document.getElementById('generated-content-wrapper');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // Deshabilitar botones de publicación al inicio
    if (publishWpDraftBtn) publishWpDraftBtn.disabled = true;
    if (publishWpPublicBtn) publishWpPublicBtn.disabled = true;

    // --- 2. FUNCIONES AUXILIARES ---

    // Función que comprueba si el usuario tiene WP configurado
    async function checkUserSettings(userId) {
        try {
            const response = await fetch(`https://api.glyphcode.com/api/wp-settings?userId=${userId}`);
            if (!response.ok) return false;
            const settings = await response.json();
            // Devuelve true solo si ambos campos existen y no están vacíos
            return (settings.wpUrl && settings.wpUsername);
        } catch (error) {
            console.error("Error al comprobar los ajustes del usuario:", error);
            return false;
        }
    }

    // Función que construye el prompt para la IA
    function constructPrompt(settings) {
        const toggles = [
            'include-conclusion', 'include-tables', 'include-h3', 'include-lists',
            'include-italic', 'include-quotes', 'include-key-takeaways',
            'include-faq', 'include-bold', 'web-access', 'include-featured-image'
        ];
        toggles.forEach(toggle => settings[toggle] = form.querySelector(`input[name="${toggle}"]`)?.checked || false);

        let prompt = `Actúa como un experto en redacción SEO y copywriting. Tu tarea es generar un artículo de alta calidad en formato Markdown.\n\n`;
        prompt += `1. **Título Principal (H1):** "${settings['article-title']}"\n`;
        prompt += `2. **Palabras Clave:** ${settings['keywords']}\n`;
        // ... (resto de tu lógica para construir el prompt) ...
        if (settings['image-quantity'] !== 'ninguna') {
            const qtyMap = { baja: '2 o 3', media: '4 o 5', alta: '6 o más' };
            prompt += ` - **Imágenes en el Cuerpo:** Inserta marcadores de imagen [IMAGEN: descripción detallada de la imagen aquí] en lugares apropiados a lo largo del texto. Debes insertar ${qtyMap[settings['image-quantity']]} imágenes en total.\n\n`;
        }
        prompt += `Ahora, genera el artículo completo.`;
        return prompt;
    }

    // Función que maneja la publicación en WordPress
    async function handlePublish(status) {
        const userId = localStorage.getItem('userId');
        const title = document.getElementById('article-title').value;
        const content = outputContainer.innerHTML;
        const buttonToUpdate = status === 'draft' ? publishWpDraftBtn : publishWpPublicBtn;

        const originalText = buttonToUpdate.innerHTML;
        buttonToUpdate.disabled = true;
        buttonToUpdate.innerHTML = `<span class="spinner"></span> PUBLICANDO...`;
        
        // Reemplaza el bloque try...catch...finally en tu form.addEventListener

try {
    // 1. Hacemos la llamada a la API para generar el artículo
    const response = await fetch('https://api.glyphcode.com/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: detailedPrompt,
            userId,
            articleKeywords: settings.keywords,
            includeFeaturedImage: form.querySelector('input[name="include-featured-image"]').checked
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error del servidor.');
    }

    // 2. Mostramos el contenido del artículo en la página
    outputContainer.innerHTML = data.articleHtml;

    // --- CAMBIO CLAVE ---
    // 3. MOSTRAMOS INMEDIATAMENTE el contenedor de acciones.
    //    Ahora los botones "Copiar" y "Descargar" serán visibles.
    actionsContainer.classList.remove('hidden');

    // 4. DESPUÉS de mostrar los botones, intentamos habilitar los de WordPress.
    //    Si esto falla, los otros botones ya estarán visibles.
    checkUserSettings(userId).then(canPublish => {
        if (canPublish) {
            console.log("Ajustes de WP correctos. Habilitando botones.");
            if (publishWpDraftBtn) publishWpDraftBtn.disabled = false;
            if (publishWpPublicBtn) publishWpPublicBtn.disabled = false;
        } else {
            console.log("No se pudo verificar los ajustes de WP o no están configurados. Los botones de publicación permanecerán deshabilitados.");
        }
    });

} catch (error) {
    outputContainer.innerHTML = `<p class="placeholder-text error-message">Error: ${error.message}.</p>`;
    // Asegurémonos de que los botones permanezcan ocultos si hay un error
    actionsContainer.classList.add('hidden');
} finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Generar de Nuevo`;
}
    }

    // Listeners para los botones de acción del contenido generado
    if (copyBtn) {
        copyBtn.addEventListener('click', () => { /* ...tu código para copiar... */ });
    }
    if (downloadHtmlBtn) {
        downloadHtmlBtn.addEventListener('click', () => { /* ...tu código para descargar... */ });
    }
    if (publishWpDraftBtn) {
        publishWpDraftBtn.addEventListener('click', () => handlePublish('draft'));
    }
    if (publishWpPublicBtn) {
        publishWpPublicBtn.addEventListener('click', () => handlePublish('publish'));
    }
});