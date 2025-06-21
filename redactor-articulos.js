// ======================================================================
// ARCHIVO COMPLETO: redactor-articulos.js (VERSIÓN 4.0 - AUTOMÁTICA)
// ======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // Variable global en este script para guardar los datos SEO generados
    let generatedSeoData = {};

    // --- 2. FUNCIONES AUXILIARES ---

    // Función para comprobar si el usuario tiene WP configurado
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

    // Función para publicar en WordPress
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
        
        const dataToSend = {
            userId,
            title,
            content,
            status,
            wp_category_id,
            seoData: generatedSeoData, // Usamos los datos SEO que guardamos antes
        };

        try {
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

    // --- 3. LISTENER PRINCIPAL DEL FORMULARIO ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) { window.location.href = '/login-generador-ia.html'; return; }

            // Resetear estado
            generateBtn.disabled = true;
            generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
            actionsContainer.classList.add('hidden');
            generatedSeoData = {}; // Limpiar datos SEO anteriores

            try {
                const formData = new FormData(form);
                const settings = Object.fromEntries(formData.entries());
                
                const seoOptions = {
                    generate_focus_keyword: formData.has('generate_focus_keyword'),
                    generate_seo_title: formData.has('generate_seo_title'),
                    generate_meta_description: formData.has('generate_meta_description'),
                    generate_tags: formData.has('generate_tags'),
                };

                const mainPrompt = `Genera un artículo sobre "${settings['article-title']}" usando las keywords: "${settings.keywords}". Incluye 3 marcadores de imagen [IMAGEN: descripción detallada].`;

                const response = await fetch('https://api.glyphcode.com/api/generate-article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mainPrompt,
                        userId,
                        articleKeywords: settings.keywords,
                        includeFeaturedImage: true,
                        seoOptions,
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error del servidor');

                // Mostrar resultados y guardar datos
                outputContainer.innerHTML = data.articleHtml;
                generatedSeoData = data.seo;
                actionsContainer.classList.remove('hidden');

                // Habilitar botones de WP si es posible
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

    // --- 4. LISTENERS PARA LOS BOTONES DE ACCIÓN ---
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