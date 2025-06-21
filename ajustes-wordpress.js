// ajustes-wordpress.js (VERSIÓN CORREGIDA)

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('wp-settings-container');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = '/login-generador-ia.html';
        return;
    }
    
    // --- FUNCIÓN renderForm (sin cambios) ---
    const renderForm = (settings = {}) => {
        container.innerHTML = `
            <div class="generator-section">
                <form id="wp-settings-form" class="contact-form">
                    <div class="form-group">
                        <label for="wpUrl">URL de tu Sitio WordPress</label>
                        <input type="url" id="wpUrl" name="wpUrl" placeholder="https://tudominio.com" required value="${settings.wpUrl || ''}">
                        <small class="form-hint">Introduce la URL completa de tu sitio.</small>
                    </div>
                    <div class="form-group">
                        <label for="wpUsername">Nombre de Usuario de WordPress</label>
                        <input type="text" id="wpUsername" name="wpUsername" placeholder="Tu usuario admin de WP" required value="${settings.wpUsername || ''}">
                    </div>
                    <div class="form-group">
                        <label for="wpPassword">Contraseña de Aplicación de WordPress</label>
                        <input type="password" id="wpPassword" name="wpPassword" placeholder="Pega aquí tu Contraseña de Aplicación">
                        <small class="form-hint">
                            Deja este campo en blanco para no cambiar tu contraseña guardada.
                            <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer">¿Cómo creo una Contraseña de Aplicación?</a>
                        </small>
                    </div>
                    <div id="form-message"></div>
                    <div class="generator-action">
                         <button type="submit" id="save-settings-btn" class="btn btn-primary">Guardar Ajustes</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('wp-settings-form').addEventListener('submit', handleFormSubmit);
    };

    // --- FUNCIÓN handleFormSubmit (sin cambios) ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-settings-btn');
        const messageDiv = document.getElementById('form-message');
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';
        messageDiv.textContent = '';
        messageDiv.className = '';

        const formData = new FormData(e.target);
        const data = {
            userId,
            wpUrl: formData.get('wpUrl'),
            wpUsername: formData.get('wpUsername'),
            wpPassword: formData.get('wpPassword'),
        };

        if (!data.wpPassword) delete data.wpPassword;

        try {
            const response = await fetch('https://api.glyphcode.com/api/wp-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al guardar los ajustes.');

            messageDiv.textContent = result.message;
            messageDiv.className = 'success-message';
        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.className = 'error-message';
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Ajustes';
            document.getElementById('wpPassword').value = ''; 
        }
    };
    
    // --- Lógica principal (MODIFICADA) ---
    const loadSettings = async () => {
        try {
            // ----- CAMBIO CLAVE AQUÍ -----
            // Ahora pasamos el userId como un parámetro de la URL (query parameter)
            // Ya no hay 'body' en la petición GET.
            const response = await fetch(`https://api.glyphcode.com/api/wp-settings?userId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
});
            // -----------------------------
            
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'No se pudieron cargar los ajustes.');
            }
            
            const userSettings = await response.json();
            renderForm(userSettings);
        } catch (error) {
            console.error('Error cargando los ajustes:', error);
            container.innerHTML = `<p class="error-message">Error: ${error.message}. Inténtalo de nuevo más tarde.</p>`;
        }
    };

    loadSettings();
});