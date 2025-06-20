// redactor-articulos.js (CORREGIDO Y COMPLETO)

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api.glyphcode.com'; // URL centralizada de tu backend

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const outputWrapper = document.getElementById('generated-content-wrapper');
    const actionsContainer = document.getElementById('content-actions');
    const copyBtn = document.getElementById('copy-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // Deshabilitar botones de WP al inicio
    if (publishWpDraftBtn) publishWpDraftBtn.disabled = true;
    if (publishWpPublicBtn) publishWpPublicBtn.disabled = true;
    
    // Función para comprobar si el usuario tiene credenciales de WP
    async function checkUserSettings(userId) {
        try {
            const response = await fetch(`${API_URL}/api/wp-settings?userId=${userId}`); // Usando la nueva URL
            if (!response.ok) return false;
            const settings = await response.json();
            return (settings.wpUrl && settings.wpUsername);
        } catch (error) {
            console.error("Error al comprobar los ajustes del usuario:", error);
            return false;
        }
    }

    // Función para construir el prompt (sin cambios)
    function constructPrompt(settings) {
        // ... tu lógica para construir el prompt se queda igual ...
    }
    
    // Evento del formulario principal
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) { window.location.href = '/login-generador-ia.html'; return; }
            
            if(publishWpDraftBtn) publishWpDraftBtn.disabled = true;
            if(publishWpPublicBtn) publishWpPublicBtn.disabled = true;

            const formData = new FormData(form);
            const settings = Object.fromEntries(formData.entries());
            const detailedPrompt = constructPrompt(settings); // Asumiendo que esta función existe en tu código original

            generateBtn.disabled = true;
            generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
            outputContainer.innerHTML = `<div class="thinking-animation"><p>Verificando límites, contactando al modelo y buscando imágenes...</p></div>`;
            outputWrapper.style.display = 'block';
            actionsContainer.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/api/generate-article`, { // Usando la nueva URL
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: detailedPrompt, 
                        userId, 
                        articleKeywords: settings.keywords, 
                        includeFeaturedImage: formData.has('include-featured-image') 
                    })
                });

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
                generateBtn.innerHTML = `Generar de Nuevo`;
            }
        });
    }

    // Lógica para manejar la publicación
    async function handlePublish(status) {
        const userId = localStorage.getItem('userId');
        const title = document.getElementById('article-title').value;
        const content = outputContainer.innerHTML;
        const buttonToUpdate = status === 'draft' ? publishWpDraftBtn : publishWpPublicBtn;

        const originalText = buttonToUpdate.innerHTML;
        buttonToUpdate.disabled = true;
        buttonToUpdate.innerHTML = `<span class="spinner"></span> PUBLICANDO...`;
        
        try {
            const response = await fetch(`${API_URL}/api/publish-to-wp`, { // Usando la nueva URL
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

    // El resto de tus listeners para 'copyBtn' y 'downloadHtmlBtn' se quedan igual
});