// redactor-articulos.js (VERSIÓN FINAL Y ENFOCADA EN LOS BOTONES)

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS A TODOS LOS ELEMENTOS ---
    // Si alguna de estas líneas da error, es porque el ID en el HTML es incorrecto.
    const form = document.getElementById('article-generator-form');
    const generateBtn = document.getElementById('generate-btn');
    const outputContainer = document.getElementById('generated-article');
    const actionsContainer = document.getElementById('content-actions'); // El contenedor de los botones
    const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    const publishWpPublicBtn = document.getElementById('publish-public-btn');

    // --- MENSAJE DE DEPURACIÓN INICIAL ---
    // Esto nos dirá si el script encuentra el contenedor de los botones al cargar la página.
    if (!actionsContainer) {
        console.error("¡ERROR CRÍTICO! No se encontró el div con id='content-actions'. Revisa tu HTML.");
        // Si no se encuentra el contenedor, no tiene sentido continuar con algunas lógicas.
        return; 
    }
    console.log("El contenedor de botones 'actionsContainer' se ha encontrado correctamente.");

    // Función para comprobar ajustes de WordPress (SIN CAMBIOS)
    async function checkUserSettings(userId) {
        try {
            const response = await fetch(`https://api.glyphcode.com/api/wp-settings?userId=${userId}`);
            if (!response.ok) return false;
            const settings = await response.json();
            return (settings.wpUrl && settings.wpUsername);
        } catch (error) {
            console.error("Error al comprobar los ajustes de WP:", error);
            return false;
        }
    }
    
    // --- 2. EL LISTENER PRINCIPAL DEL FORMULARIO ---
    if (form) {
        form.addEventListener('submit', async (e) => {
            // Previene que la página se recargue (esto ya funcionaba)
            e.preventDefault();

            const userId = localStorage.getItem('userId');
            if (!userId) {
                window.location.href = '/login-generador-ia.html';
                return;
            }

            // --- LÓGICA DE PREPARACIÓN (ANTES DE GENERAR) ---
            generateBtn.disabled = true;
            generateBtn.innerHTML = `<span class="spinner"></span>GENERANDO...`;
            // ¡Importante! Ocultamos los botones de la generación anterior.
            actionsContainer.classList.add('hidden'); 
            // Limpiamos los botones de publicación
            if (publishWpDraftBtn) publishWpDraftBtn.disabled = true;
            if (publishWpPublicBtn) publishWpPublicBtn.disabled = true;


            // --- LÓGICA DE GENERACIÓN ---
            try {
                // (Aquí va toda tu lógica para construir el 'body' de la petición)
                const formData = new FormData(form);
                const settings = Object.fromEntries(formData.entries());
                // ... más lógica de settings si la tienes ...
                const detailedPrompt = "Construye el prompt como lo tenías..."; // Asegúrate que tu lógica de prompt esté aquí
                
                const body = {
                    prompt: detailedPrompt,
                    userId,
                    articleKeywords: settings.keywords,
                    includeFeaturedImage: form.querySelector('input[name="include-featured-image"]').checked
                };

                const response = await fetch('https://api.glyphcode.com/api/generate-article', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Hubo un error en el servidor al generar el artículo.');
                }

                // --- LÓGICA DE ÉXITO (DESPUÉS DE GENERAR) ---
                
                // 1. Muestra el artículo
                outputContainer.innerHTML = data.articleHtml;

                // 2. MUESTRA LOS BOTONES
                console.log("Artículo generado con éxito. Mostrando los botones de acción...");
                actionsContainer.classList.remove('hidden');

                // 3. Intenta habilitar los botones de WordPress
                const canPublish = await checkUserSettings(userId);
                if (canPublish) {
                    console.log("Usuario tiene credenciales de WP. Habilitando botones de publicación.");
                    if (publishWpDraftBtn) publishWpDraftBtn.disabled = false;
                    if (publishWpPublicBtn) publishWpPublicBtn.disabled = false;
                } else {
                     console.log("Usuario SIN credenciales de WP. Botones de publicación deshabilitados.");
                }

            } catch (error) {
                console.error("Error en el proceso de generación:", error);
                outputContainer.innerHTML = `<p class="placeholder-text error-message">Error: ${error.message}</p>`;
            } finally {
                // Pase lo que pase, el botón de generar se vuelve a habilitar
                generateBtn.disabled = false;
                generateBtn.innerHTML = `Generar de Nuevo`;
            }
        });
    }

    // Aquí puedes añadir la lógica de los botones (Copiar, Descargar, Publicar)
    // que ya tenías. Por ejemplo:
    // const publishWpDraftBtn = document.getElementById('publish-draft-btn');
    // if(publishWpDraftBtn) {
    //     publishWpDraftBtn.addEventListener('click', () => handlePublish('draft'));
    // }
});