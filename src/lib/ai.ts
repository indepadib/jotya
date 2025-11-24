export interface AIAnalysisResult {
    brand?: string;
    color?: string;
    category?: string;
    material?: string;
    style?: string;
    fit?: string;
    confidence: number;
    isAuthentic: boolean;
    checks?: { name: string; passed: boolean }[];
}

export async function analyzeImage(base64Image: string, imageType: 'general' | 'label' = 'general'): Promise<AIAnalysisResult> {
    // Simulate network delay (1.5 - 2.5 seconds)
    const delay = Math.floor(Math.random() * 1000) + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Mock logic: In a real app, this would call OpenAI Vision or Google Cloud Vision
    // For demo purposes, we'll return a "successful" analysis

    const brands = [
        { brand: "Ralph Lauren", color: "Navy Blue", material: "100% Cotton Piqué", style: "Classic Polo", fit: "Slim Fit" },
        { brand: "Tommy Hilfiger", color: "Red/White/Blue", material: "Organic Cotton", style: "V-Neck Tee", fit: "Regular Fit" },
        { brand: "Nike", color: "Black", material: "Dri-FIT Polyester", style: "Athletic Shirt", fit: "Performance Fit" },
        { brand: "Zara", color: "Beige", material: "Linen Blend", style: "Casual Shirt", fit: "Relaxed Fit" }
    ];

    // Pick a random brand based on the image string length (pseudo-random but consistent for same image)
    const index = base64Image.length % brands.length;
    const selected = brands[index];

    if (imageType === 'label') {
        return {
            brand: selected.brand,
            confidence: 0.99,
            isAuthentic: true,
            checks: [
                { name: "Font Match (Serif)", passed: true },
                { name: "Spacing Consistency", passed: true },
                { name: "Origin Tag (Made in)", passed: true },
                { name: "Stitching Quality", passed: true }
            ]
        };
    }

    return {
        brand: selected.brand,
        color: selected.color,
        category: "Clothing",
        material: selected.material,
        style: selected.style,
        fit: selected.fit,
        confidence: 0.98,
        isAuthentic: false, // General photos don't prove authenticity anymore
        checks: [
            { name: "Brand Detection", passed: true },
            { name: "Item Categorization", passed: true }
        ]
    };
}

export async function generateDescription(details: { brand: string; color: string; category: string; title: string; material?: string; style?: string; fit?: string }): Promise<string> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const materialText = details.material ? `Crafted from premium **${details.material}**` : 'Made from high-quality materials';
    const styleText = details.style ? `this **${details.style}**` : 'this piece';
    const fitText = details.fit ? `featuring a flattering **${details.fit}**` : '';

    return `Elevate your wardrobe with this authentic **${details.brand} ${details.title}**. 

${materialText}, ${styleText} combines timeless elegance with modern comfort. The rich **${details.color}** hue makes it a versatile addition to any outfit, ${fitText}.

**Key Features:**
✨ **Brand:** ${details.brand} (Verified Authentic)
🎨 **Color:** ${details.color}
🧵 **Material:** ${details.material || 'Premium Fabric'}
📏 **Fit:** ${details.fit || 'Standard'}
💎 **Condition:** Excellent

Verified by Jotya AI 🛡️.
#${details.brand.replace(/\s+/g, '')} #VintageStyle #SustainableFashion`;
}
