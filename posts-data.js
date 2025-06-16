// ====================================================================
// ===       LA ÚNICA FUENTE DE VERDAD PARA TODOS LOS POSTS       ===
// ====================================================================
// Para añadir un nuevo post, solo tienes que añadir un nuevo objeto
// al principio de esta lista. La web se actualizará sola.

const posts = [
    {
        url: '/posts/optimizando-python-con-rust.html',
        image: '/assets/images/rust-python.jpg',
        altText: 'Logo de Rust y Python juntos',
        date: '2025-06-16', // Formato AAAA-MM-DD
        category: 'PYTHON & RUST',
        title: 'Optimizando Python con Rust: Un Caso Práctico',
        excerpt: 'Exploramos cómo reescribir cuellos de botella de un script de Python en Rust puede multiplicar el rendimiento por 100.'
    },
    {
        url: '/posts/fine-tuning-llm.html',
        image: '/assets/images/llm-code.jpg',
        altText: 'Visualización abstracta de un modelo de lenguaje generando código',
        date: '2025-06-15',
        category: 'MODELOS IA',
        title: 'Fine-Tuning de un LLM para Generación de Código',
        excerpt: 'Análisis del proceso de ajuste fino de un modelo de lenguaje para especializarlo en la sintaxis de Kotlin, incluyendo desafíos y resultados.'
    },
    // --- EJEMPLO DE NUEVO POST ---
    // {
    //     url: '/posts/mi-nuevo-post.html',
    //     image: '/assets/images/nueva-imagen.jpg',
    //     altText: 'Descripción de la nueva imagen',
    //     date: '2025-06-17',
    //     category: 'NUEVA CATEGORÍA',
    //     title: 'Título de Mi Nuevo Post',
    //     excerpt: 'Este es un resumen de mi increíble nuevo post.'
    // },
];

// --- FUNCIÓN PARA FORMATEAR LA FECHA (para no repetir código) ---
function formatPostDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('es-ES', options).toUpperCase();
}


// --- LÓGICA PARA RENDERIZAR LAS DIFERENTES SECCIONES ---

// 1. Rellena la página del blog (blog.html)
function renderBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return; // Solo se ejecuta si encuentra el contenedor

    blogGrid.innerHTML = ''; // Limpiamos el contenedor
    posts.forEach(post => {
        blogGrid.innerHTML += `
            <article class="post-card-blog">
                <a href="${post.url}" class="post-card-image-link">
                    <img src="${post.image}" alt="${post.altText}">
                </a>
                <div class="post-card-content">
                    <p class="post-meta"><span>${formatPostDate(post.date)}</span> // <span>${post.category}</span></p>
                    <h2 class="post-card-title"><a href="${post.url}">${post.title}</a></h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="${post.url}" class="post-link">Leer Análisis Completo →</a>
                </div>
            </article>
        `;
    });
}

// 2. Rellena la sección "Análisis y Papers" de la página de inicio (index.html)
function renderLatestPosts() {
    const latestPostsGrid = document.getElementById('latest-posts-grid');
    if (!latestPostsGrid) return;

    latestPostsGrid.innerHTML = '';
    const postsToShow = posts.slice(0, 2); // Tomamos solo los 2 primeros (los más nuevos)

    postsToShow.forEach(post => {
        latestPostsGrid.innerHTML += `
            <article class="post-card">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="${post.url}" class="post-link">Leer Análisis →</a>
            </article>
        `;
    });
}

// 3. Rellena la barra lateral "Otros Análisis" en cada post individual
function renderSidebarPosts() {
    const sidebarList = document.getElementById('sidebar-post-list');
    if (!sidebarList) return;

    sidebarList.innerHTML = '';
    const currentPageUrl = window.location.pathname;

    posts.forEach(post => {
        // No mostramos el post actual en su propia barra lateral
        if (post.url === currentPageUrl) {
            return;
        }
        sidebarList.innerHTML += `
            <li><a href="${post.url}">${post.title}</a></li>
        `;
    });
}


// --- EJECUTAR TODO CUANDO LA PÁGINA CARGUE ---
document.addEventListener('DOMContentLoaded', () => {
    renderBlogPosts();
    renderLatestPosts();
    renderSidebarPosts();
});