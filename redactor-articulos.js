// redactor-articulos.js (VERSIÓN FINAL, SIN VUELTAS)

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // Comprobación inicial
    if (!form || !generateBtn || !actionsContainer) {
        console.error("Falta un elemento HTML esencial (formulario, botón de generar o contenedor de acciones). Revisa los IDs.");
        return;
    }

    // Funciones auxiliares
    async function checkUserSettings(userId) {
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
        const buttonToUpdate = status === 'draft' ? publishWpDraftBtn : publishWpPublicBtn;

        if (!buttonToUpdate || !title || !content) return;

        const originalText = buttonToUpdate.innerHTML;
        buttonToUpdate.disabled = true;
        buttonToUpdate.innerHTML = `<span>...</span>`;
        
        try {
            const response = await fetch('https://api.glyphcode.com/api/publish-to-wp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title, content, status }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            alert(`Éxito: ${result.message}`);
        } catch (error) {
            alert(`Error de publicación: ${error.message}`);
        } finally {
            buttonToUpdate.innerHTML = originalText;
            buttonToUpdate.disabled = false;
        }
    }

    // Listener del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) { window.location.href = '/login-generador-ia.html'; return; }

        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
        actionsContainer.classList.add('hidden');
        if(publishWpDraftBtn) publishWpDraftBtn.disabled = true;
        if(publishWpPublicBtn) publishWpPublicBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const settings = Object.fromEntries(formData.entries());
            const prompt = `Genera un artículo sobre "${settings['article-title']}" con las keywords "${settings.keywords}". Incluye 3 marcadores de imagen [IMAGEN: descripción].`;
            
            const response = await fetch('https://api.glyphcode.com/api/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    userId: userId,
                    articleKeywords: settings.keywords,
                    includeFeaturedImage: true
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error del servidor');

            outputContainer.innerHTML = data.articleHtml;
            actionsContainer.classList.remove('hidden'); // <-- La línea clave

            const canPublish = await checkUserSettings(userId);
            if (canPublish) {
                if(publishWpDraftBtn) publishWpDraftBtn.disabled = false;
                if(publishWpPublicBtn) publishWpPublicBtn.disabled = false;
            }

        } catch (error) {
            outputContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `Generar de Nuevo`;
        }
    });

    // Listeners para los botones de acción
    if(copyBtn) copyBtn.addEventListener('click', () => navigator.clipboard.writeText(outputContainer.innerText));
    if(downloadHtmlBtn) {
        downloadHtmlBtn.addEventListener('click', () => {
            const blob = new Blob([outputContainer.innerHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'articulo.html';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    if(publishWpDraftBtn) publishWpDraftBtn.addEventListener('click', () => handlePublish('draft'));
    if(publishWpPublicBtn) publishWpPublicBtn.addEventListener('click', () => handlePublish('publish'));
});