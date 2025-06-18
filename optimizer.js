document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const codeInput = document.getElementById('python-code-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const suggestionsOutput = document.getElementById('optimization-suggestions');

    // El "cerebro" del optimizador: una lista de reglas
    // Cada regla tiene un patrón (expresión regular) y una sugerencia.
    const rules = [
        {
            name: 'Comparación Booleana Ineficiente',
            pattern: /==\s*True/g,
            suggestion: 'Usa <code>is True</code> (o simplemente <code>if variable:</code>) en lugar de <code>== True</code>. Es más pitónico y ligeramente más rápido.'
        },
        {
            name: 'Comparación con None Ineficiente',
            pattern: /==\s*None/g,
            suggestion: 'Usa <code>is None</code> en lugar de <code>== None</code>. Es la forma canónica y más segura de comprobar si una variable es None.'
        },
        {
            name: 'Comprobación de Lista Vacía',
            pattern: /len\((.*?)\)\s*==\s*0/g,
            suggestion: 'En lugar de <code>len(lista) == 0</code>, usa la "verdad" de los contenedores: <code>if not lista:</code>. Es más legible y pitónico.'
        },
        {
            name: 'Iteración Estilo C',
            pattern: /for\s+i\s+in\s+range\(len\((.*?)\)\)/g,
            suggestion: 'En lugar de <code>for i in range(len(lista)):</code>, itera directamente sobre los elementos con <code>for item in lista:</code>. Si necesitas el índice, usa <code>for i, item in enumerate(lista):</code>.'
        },
        {
            name: 'Uso de "in" en Diccionarios',
            pattern: /\.keys\(\)/g,
            suggestion: 'No necesitas usar <code>.keys()</code> para comprobar la existencia de una clave. <code>if "clave" in mi_dict:</code> es más rápido y limpio que <code>if "clave" in mi_dict.keys():</code>.'
        }
    ];

    // Función que se ejecuta al hacer clic en el botón
    analyzeBtn.addEventListener('click', () => {
        const code = codeInput.value;
        if (!code.trim()) {
            suggestionsOutput.innerHTML = '<p class="placeholder-text">Por favor, introduce algo de código para analizar.</p>';
            return;
        }

        // Simular que la "IA" está pensando
        suggestionsOutput.innerHTML = '<p class="placeholder-text">Analizando código...</p>';
        suggestionsOutput.classList.add('thinking');
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'PROCESANDO...';

        setTimeout(() => {
            const suggestions = [];
            // Aplicar cada regla al código
            rules.forEach(rule => {
                if (rule.pattern.test(code)) {
                    suggestions.push({ title: rule.name, text: rule.suggestion });
                }
            });

            // Mostrar los resultados
            displaySuggestions(suggestions);
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analizar Código >>';
            suggestionsOutput.classList.remove('thinking');
        }, 1500); // Retraso de 1.5 segundos para que parezca realista
    });

    // Función para mostrar las sugerencias en el DOM
    function displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            suggestionsOutput.innerHTML = '<p class="placeholder-text">¡Análisis completado! Tu código se ve bastante limpio desde la perspectiva de estos patrones básicos.</p>';
            return;
        }

        let html = '<ul class="suggestions-list">';
        suggestions.forEach(sugg => {
            html += `<li class="suggestion-item"><strong>${sugg.title}</strong><p>${sugg.text}</p></li>`;
        });
        html += '</ul>';

        suggestionsOutput.innerHTML = html;
    }
});