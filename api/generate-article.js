// api/generate-article.js (VERSIÓN 3.2 - SIN DESCRIPCIÓN EN IMÁGENES)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { marked } from 'marked';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pexelsApiKey = process.env.PEXELS_API_KEY;
const pixabayApiKey = process.env.PIXABAY_API_KEY;

const planLimits = { FREE: 5, MEDIUM: 150, BUSINESS: 350 };

async function getKeywordsFromDescription(description) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `From the following image description, extract a maximum of 5 essential keywords for searching a stock photo API. Return only the keywords separated by commas, in English. Description: "${description}"`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error al extraer keywords de la descripción:", error);
        return description;
    }
}

async function searchImage(query, contextKeywords, page) {
    const finalQuery = `${contextKeywords} ${query}`;
    
    if (pexelsApiKey) {
        try {
            const response = await axios.get(`https://api.pexels.com/v1/search`, {
                headers: { Authorization: pexelsApiKey },
                params: { query: finalQuery, per_page: 1, orientation: 'landscape', page: page },
            });
            if (response.data.photos && response.data.photos.length > 0) return response.data.photos[0].src.large2x;
        } catch (error) { console.error('Error Pexels:', error.message); }
    }

    if (pixabayApiKey) {
        try {
            const response = await axios.get(`https://pixabay.com/api/`, {
                params: { key: pixabayApiKey, q: finalQuery, image_type: 'photo', orientation: 'horizontal', per_page: 1, page: page },
            });
            if (response.data.hits && response.data.hits.length > 0) return response.data.hits[0].largeImageURL;
        } catch (error) { console.error('Error Pixabay:', error.message); }
    }
    
    console.warn(`No se encontró imagen para "${finalQuery}" en la página ${page}`);
    return null; 
}


export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST requests allowed' });

    const { prompt, userId, articleKeywords, includeFeaturedImage } = req.body;

    if (!prompt || !userId) return res.status(400).json({ error: 'Faltan datos.' });

    try {
        // ... (lógica de límites) ...
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const markdownText = result.response.text();

        const imagePlaceholderRegex = /\[IMAGEN: (.*?)\]/g;
        const imageDescriptions = [];
        let match;
        while ((match = imagePlaceholderRegex.exec(markdownText)) !== null) {
            imageDescriptions.push(match[1].trim());
        }

        const refinedKeywords = await Promise.all(
            imageDescriptions.map(desc => getKeywordsFromDescription(desc))
        );
        
        const imageUrls = await Promise.all(
            refinedKeywords.map((rk, index) => searchImage(rk, articleKeywords || '', index + 1))
        );
        
        let finalHtml = marked.parse(markdownText);
        
        if (imageUrls.length > 0) {
            let imageIndex = 0;
            finalHtml = finalHtml.replace(/<p>\[IMAGEN: (.*?)\]<\/p>/g, () => {
                const imageUrl = imageUrls[imageIndex];
                const description = imageDescriptions[imageIndex];
                const isFeatured = includeFeaturedImage && imageIndex === 0;
                const figureClass = isFeatured ? 'generated-image featured-image' : 'generated-image';
                imageIndex++;
                
                if (!imageUrl) return ''; 

                // --- ESTA ES LA PARTE QUE CAMBIA ---
                // Antes había un <figcaption>${description}</figcaption>
                // Ahora lo hemos quitado para que no aparezca el texto debajo.
                return `
                    <figure class="${figureClass}">
                        <img src="${imageUrl}" alt="${description}" loading="lazy">
                    </figure>
                `;
            });
        }
        
        // ... (lógica de actualización de contador) ...
        
        res.status(200).json({ articleHtml: finalHtml });

    } catch (error) {
        console.error('Error en generate-article:', error);
        res.status(500).json({ error: 'Hubo un error.', details: error.message });
    }
}