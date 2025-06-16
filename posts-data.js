// ====================================================================
// ===       LA ÚNICA FUENTE DE VERDAD PARA TODOS LOS POSTS       ===
// ====================================================================
const posts = [
    {
        url: '/posts/por-que-aprender-python.html',
        image: '/assets/images/python-beginners.jpg',
        altText: 'Logo de Python sobre un fondo de código abstracto.',
        date: '2025-06-17',
        category: 'PROGRAMACIÓN',
        title: '¿Por Qué Python es el Lenguaje Perfecto para Empezar a Programar?',
        excerpt: 'Descubre por qué la sintaxis sencilla y el poderoso ecosistema de Python lo convierten en el lenguaje ideal para principiantes.'
    },
    {
        url: '/posts/optimizando-python-con-rust.html',
        image: '/assets/images/rust-python.jpg',
        altText: 'Logo de Rust y Python juntos',
        date: '2025-06-16',
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
];

// --- FUNCIONES AUXILIARES ---
function formatPostDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('es-ES', options).toUpperCase();
}

const allCategories = [...new Set(posts.map(p => p.category))]; // Obtenemos una lista única de todas las categorías

// --- RENDERIZADO DE COMPONENTES ---

// 1. Rellena la página del blog y aplica filtros
function renderBlogPosts(filterCategory = 'all') {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    const filteredPosts = filterCategory === 'all' ? posts : posts.filter(p => p.category === filterCategory);
    
    blogGrid.innerHTML = ''; // Limpiamos la rejilla
    filteredPosts.forEach(post => {
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

// 2. Rellena la sección de posts recientes en la home
function renderLatestPosts() {
    const latestPostsGrid = document.getElementById('latest-posts-grid');
    if (!latestPostsGrid) return;

    latestPostsGrid.innerHTML = '';
    posts.slice(0, 2).forEach(post => {
        latestPostsGrid.innerHTML += `
            <article class="post-card">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="${post.url}" class="post-link">Leer Análisis →</a>
            </article>
        `;
    });
}

// 3. Rellena la barra lateral en los posts
function renderSidebarPosts() {
    const sidebarList = document.getElementById('sidebar-post-list');
    if (!sidebarList) return;

    sidebarList.innerHTML = '';
    const currentPageUrl = window.location.pathname;
    posts.filter(p => p.url !== currentPageUrl).forEach(post => {
        sidebarList.innerHTML += `<li><a href="${post.url}">${post.title}</a></li>`;
    });
}

// 4. Rellena el submenú del blog en el header
function renderBlogDropdown() {
    const dropdownMenu = document.getElementById('blog-dropdown-menu');
    if (!dropdownMenu) return;

    dropdownMenu.innerHTML = '';
    allCategories.forEach(category => {
        // Creamos un enlace que lleva a la página del blog y pasa la categoría como parámetro
        dropdownMenu.innerHTML += `<li><a href="/blog.html?categoria=${encodeURIComponent(category)}">${category}</a></li>`;
    });
}

// 5. Rellena los botones de filtro en la página del blog
function renderCategoryFilters() {
    const filtersContainer = document.getElementById('category-filters');
    if (!filtersContainer) return;

    // Botón "TODOS"
    let buttonsHTML = `<button class="category-filter-btn active" data-category="all">TODOS</button>`;
    
    // Botones para cada categoría
    allCategories.forEach(category => {
        buttonsHTML += `<button class="category-filter-btn" data-category="${category}">${category}</button>`;
    });

    filtersContainer.innerHTML = buttonsHTML;

    // Añadir funcionalidad a los botones
    filtersContainer.querySelectorAll('.category-filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar clase activa
            filtersContainer.querySelector('.active').classList.remove('active');
            button.classList.add('active');
            // Renderizar posts con el filtro
            const category = button.getAttribute('data-category');
            renderBlogPosts(category);
        });
    });
}

// --- EJECUTAR TODO AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // Primero, revisamos si venimos de un clic en el submenú
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get('categoria');

    // Renderizamos todos los componentes
    renderBlogDropdown();
    renderCategoryFilters();
    renderBlogPosts(categoryFromURL || 'all'); // Usamos la categoría de la URL si existe
    renderLatestPosts();
    renderSidebarPosts();

    // Si hay una categoría en la URL, activamos el botón correspondiente
    if (categoryFromURL) {
        const filtersContainer = document.getElementById('category-filters');
        if (filtersContainer) {
            filtersContainer.querySelector('.active')?.classList.remove('active');
            filtersContainer.querySelector(`[data-category="${categoryFromURL}"]`)?.classList.add('active');
        }
    }
});