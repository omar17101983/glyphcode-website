// redactor-articulos.js (VERSIÓN 4.1 - ENVIANDO featuredImageUrl)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // --- CAMBIO: AÑADIMOS UNA VARIABLE PARA LA IMAGEN DESTACADA ---
    let generatedSeoData = {};
    let featuredImageUrl = null;

    async function checkUserSettings(userId) {
        if (!userId) return false;
        try {
            const response = await fetch(`https://api.glyphcode.com/api/wp-settings?userId=${userId}`);
            if (!response.ok) return false;
            const settings = await response.json();
            return !!(settings.wpUrl && settings.wpUsername);
        } catch (error) {
            console.error("Error al comprobar ajustes de WP:", error);
            return false;
        }
    }

    async function handlePublish(status) {
        const userId = localStorage.getItem('userId');
        const title = document.getElementById('article-title').value;
        const content = outputContainer.innerHTML;
        const wp_category_id = document.getElementById('wp_category_id').value;
        const buttonToUpdate = status === 'draft' ? publishWpDraftBtn : publishWpPublicBtn;

        if (!buttonToUpdate) return;
        const originalText = buttonToUpdate.innerHTML;
        buttonToUpdate.disabled = true;
        buttonToUpdate.innerHTML = `<span class="spinner"></span> PUBLICANDO...`;
        
        // --- CAMBIO: AÑADIMOS featuredImageUrl AL OBJETO QUE ENVIAMOS ---
        const dataToSend = {
            userId,
            title,
            content,
            status,
            wp_category_id,
            seoData: generatedSeoData,
            featuredImageUrl: featuredImageUrl, // <-- AQUÍ
        };

        try {
            // La URL de la API ya está en tu código, la mantengo
            const response = await fetch('https://api.glyphcode.com/api/publish-to-wp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Error del servidor: ${response.status}`);
            alert(`Éxito: ${result.message}\nEnlace: ${result.postLink}`);
        } catch (error) {
            console.error(`Error al publicar como ${status}:`, error);
            alert(`Error de publicación: ${error.message}`);
        } finally {
            buttonToUpdate.innerHTML = originalText;
            buttonToUpdate.disabled = false;
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) { window.location.href = '/login-generador-ia.html'; return; }

            generateBtn.disabled = true;
            generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
            actionsContainer.classList.add('hidden');
            // --- CAMBIO: RESETEAMOS AMBAS VARIABLES GLOBALES ---
            generatedSeoData = {};
            featuredImageUrl = null;

            try {
                const formData = new FormData(form);
                const settings = Object.fromEntries(formData.entries());
                
                const seoOptions = {
                    generate_focus_keyword: formData.has('generate_focus_keyword'),
                    generate_seo_title: formData.has('generate_seo_title'),
                    generate_meta_description: formData.has('generate_meta_description'),
                };

                const mainPrompt = `Genera un artículo para un blog sobre el tema "${settings['article-title']}" utilizando las siguientes palabras clave como guía: "${settings.keywords}". El tono debe ser profesional pero accesible. Estructura el artículo con un título principal (H1), una introducción, varios subtítulos (H2) con sus párrafos correspondientes, y una conclusión. Incluye 3 marcadores de imagen en lugares relevantes del texto, usando el formato [IMAGEN: descripción detallada de la imagen aquí].`;

                const response = await fetch('https://api.glyphcode.com/api/generate-article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mainPrompt,
                        userId,
                        articleKeywords: settings.keywords,
                        includeFeaturedImage: formData.has('include-featured-image'),
                        seoOptions,
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error del servidor');

                // --- CAMBIO: GUARDAMOS TODOS LOS DATOS RECIBIDOS ---
                outputContainer.innerHTML = data.articleHtml;
                generatedSeoData = data.seo;
                featuredImageUrl = data.featuredImageUrl; // <-- AQUÍ
                
                actionsContainer.classList.remove('hidden');

                if (publishWpDraftBtn) publishWpDraftBtn.disabled = true;
                if (publishWpPublicBtn) publishWpPublicBtn.disabled = true;
                const canPublish = await checkUserSettings(userId);
                if (canPublish) {
                    if (publishWpDraftBtn) publishWpDraftBtn.disabled = false;
                    if (publishWpPublicBtn) publishWpPublicBtn.disabled = false;
                }

            } catch (error) {
                outputContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = `Generar de Nuevo`;
            }
        });
    }

    // --- SIN CAMBIOS EN LOS LISTENERS DE ACCIÓN ---
    if (copyBtn) copyBtn.addEventListener('click', () => {
        if (outputContainer) navigator.clipboard.writeText(outputContainer.innerText);
        alert("Texto copiado al portapapeles.");
    });
    
    if (downloadHtmlBtn) downloadHtmlBtn.addEventListener('click', () => {
        if (!outputContainer) return;
        const blob = new Blob([outputContainer.innerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'articulo.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    if (publishWpDraftBtn) publishWpDraftBtn.addEventListener('click', () => handlePublish('draft'));
    if (publishWpPublicBtn) publishWpPublicBtn.addEventListener('click', () => handlePublish('publish'));
});