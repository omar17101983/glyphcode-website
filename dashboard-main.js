// dashboard-main.js

document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    
    // Elementos del DOM para actualizar
    const widget = document.getElementById('user-status-widget');
    const planNameEl = document.getElementById('user-plan-name');
    const usageTextEl = document.getElementById('user-usage-text');
    const progressBarEl = document.getElementById('user-usage-progress');
    const userEmailEl = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    if (!userId) {
        // Si no hay usuario, redirigir a la página de login
        window.location.href = '/login-generador-ia.html';
        return;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userId');
            window.location.href = '/login-generador-ia.html';
        });
    }

    try {
        const response = await fetch('/api/get-user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId }),
        });

        if (!response.ok) {
            // Si el usuario no se encuentra o hay otro error, lo deslogueamos
            const errorData = await response.json();
            console.error('Error fetching user status:', errorData.error);
            localStorage.removeItem('userId');
            window.location.href = '/login-generador-ia.html';
            return;
        }

        const data = await response.json();

        const usagePercentage = (data.articleCount / data.limit) * 100;

        // Actualizamos el DOM con los datos del usuario
        if (planNameEl) planNameEl.textContent = `Plan ${data.plan}`;
        if (usageTextEl) usageTextEl.textContent = `${data.articleCount} / ${data.limit} artículos generados`;
        if (userEmailEl) userEmailEl.textContent = data.email;
        if (progressBarEl) progressBarEl.style.width = `${usagePercentage}%`;
        
        // Hacemos visible el widget
        if (widget) widget.classList.remove('hidden');

    } catch (error) {
        console.error('Error en el script del dashboard:', error);
        // Opcional: mostrar un mensaje de error en la página
    }
});