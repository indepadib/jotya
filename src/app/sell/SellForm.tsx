
'use client';

import { createListing, updateListing } from '@/app/actions/listing';
import { analyzeListingImage, generateListingDescription } from '@/app/actions/ai';
import ImageUploader from '@/components/Sell/ImageUploader';
import { categories, GenderKey } from '../search/categories';
import styles from './sell.module.css';
import { useState, useEffect } from 'react';

interface SellFormProps {
    initialData?: {
        id: string;
        title: string;
        description: string;
        price: number;
        images: string;
        brand: string | null;
        condition: string;
        size: string | null;
        color: string | null;
        verified: boolean;
        aiConfidence: number | null;
    };
}

export default function SellForm({ initialData }: SellFormProps) {
    console.log('SellForm rendering', { initialData, categoriesDefined: !!categories });
    const [images, setImages] = useState<string[]>(initialData ? JSON.parse(initialData.images) : []);
    const [labelImage, setLabelImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalyzingLabel, setIsAnalyzingLabel] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [aiData, setAiData] = useState<{
        brand?: string;
        brandId?: string;
        color?: string;
        colorId?: string;
        verified?: boolean;
        checks?: { name: string; passed: boolean }[];
        material?: string;
        style?: string;
        fit?: string;
        gender?: string;
        category?: string;
        itemType?: string;
    } | null>(initialData ? {
        brand: initialData.brand || undefined,
        color: initialData.color || undefined,
        verified: initialData.verified,
    } : null);

    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [brand, setBrand] = useState(initialData?.brand || '');
    const [brandId, setBrandId] = useState('');
    const [customBrand, setCustomBrand] = useState('');
    const [color, setColor] = useState(initialData?.color || '');
    const [colorId, setColorId] = useState('');
    const [size, setSize] = useState(initialData?.size || '');
    const [sizeId, setSizeId] = useState('');
    const [condition, setCondition] = useState(initialData?.condition || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price.toString() || '');

    // Reference data
    const [brands, setBrands] = useState<{ id: string; name: string; category: string | null; verified: boolean }[]>([]);
    const [colors, setColors] = useState<{ id: string; name: string; hexCode: string; category: string }[]>([]);
    const [sizes, setSizes] = useState<{ id: string; value: string; system: string }[]>([]);
    const [brandSearch, setBrandSearch] = useState('');

    // Category state
    const [gender, setGender] = useState('');
    const [category, setCategory] = useState('');
    const [itemType, setItemType] = useState('');
    const [subtype, setSubtype] = useState('');

    // Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            const res = await fetch('/api/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        };
        fetchBrands();
    }, []);

    // Fetch colors
    useEffect(() => {
        const fetchColors = async () => {
            const res = await fetch('/api/colors');
            if (res.ok) {
                const data = await res.json();
                setColors(data);
            }
        };
        fetchColors();
    }, []);

    // Fetch sizes based on category and gender
    useEffect(() => {
        const fetchSizes = async () => {
            if (!category) return;

            // Map form categories to size categories
            let sizeCategory = 'clothing';
            if (category === 'shoes') {
                sizeCategory = 'shoes';
            } else if (category === 'accessories') {
                sizeCategory = 'accessories';
            } else if (category === 'clothes') {
                sizeCategory = 'clothing';
            }

            // Map itemType to size itemType for clothing
            let sizeItemType = null;
            if (sizeCategory === 'clothing' && itemType) {
                // Map specific clothing types to generic size types
                const topTypes = ['tshirts', 'tops', 'blouses', 'sweaters', 'blazers', 'suits', 'coats', 'outerwear'];
                const bottomTypes = ['jeans', 'pants', 'shorts', 'skirts', 'bottoms'];
                const dressTypes = ['dresses'];

                if (topTypes.includes(itemType)) {
                    sizeItemType = 'tops';
                } else if (bottomTypes.includes(itemType)) {
                    sizeItemType = 'bottoms';
                } else if (dressTypes.includes(itemType)) {
                    sizeItemType = 'dresses';
                }
            }

            const params = new URLSearchParams({
                category: sizeCategory,
                ...(gender && { gender }),
                ...(sizeItemType && { itemType: sizeItemType }),
            });

            const res = await fetch(`/api/sizes?${params}`);
            if (res.ok) {
                const data = await res.json();
                setSizes(data);
            }
        };
        fetchSizes();
    }, [category, gender, itemType]);

    // Trigger AI analysis when the first image is uploaded (General Analysis)
    useEffect(() => {
        if (images.length > 0 && !aiData && !isAnalyzing && !initialData) {
            const analyze = async () => {
                setIsAnalyzing(true);
                try {
                    // Use up to 3 images for better context
                    const imagesToAnalyze = images.slice(0, 3);
                    const result = await analyzeListingImage(imagesToAnalyze, 'general');
                    if (result) {
                        setAiData(prev => ({
                            ...prev,
                            brand: result.brand,
                            color: result.color,
                            material: result.material,
                            style: result.style,
                            fit: result.fit,
                            // Keep existing checks if any, or use general ones
                            checks: prev?.checks || result.checks,
                            gender: result.gender,
                            category: result.category,
                            itemType: result.itemType
                        }));

                        // Auto-fill title if not set
                        if (!title) {
                            const richTitle = `${result.brand || ''} ${result.style || result.category || 'Item'} - ${result.color || ''} ${result.fit ? `(${result.fit})` : ''}`;
                            setTitle(richTitle.trim());
                        }
                    }
                } catch (error) {
                    console.error('AI Analysis Failed:', error);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            analyze();
        }
    }, [images, aiData, isAnalyzing, title, initialData]);

    // Auto-fill brand when brands are loaded and AI has detected a brand
    useEffect(() => {
        if (aiData?.brand && brands.length > 0 && !brandId && !brand) {
            // Priority 1: Use ID returned by AI
            if (aiData.brandId) {
                setBrandId(aiData.brandId);
                setBrand(aiData.brand);
                return;
            }

            // Priority 2: Find matching brand in the brands list (case-insensitive)
            const matchingBrand = brands.find(b =>
                b.name.toLowerCase() === aiData.brand!.toLowerCase()
            );
            if (matchingBrand) {
                setBrandId(matchingBrand.id);
                setBrand(matchingBrand.name);
            } else {
                // If brand not found in list, use "other" and set custom brand
                setBrandId('other');
                setCustomBrand(aiData.brand);
                setBrand(aiData.brand);
            }
        }
    }, [aiData, brands, brandId, brand]);

    // Auto-fill color when colors are loaded and AI has detected a color
    useEffect(() => {
        if (aiData?.color && colors.length > 0 && !colorId && !color) {
            // Priority 1: Use ID returned by AI
            if (aiData.colorId) {
                setColorId(aiData.colorId);
                setColor(aiData.color);
                return;
            }

            const detectedColor = aiData.color.toLowerCase();
            console.log('AI detected color:', detectedColor);
            console.log('Available colors:', colors.map(c => c.name));

            // Try exact match first
            let matchingColor = colors.find(c =>
                c.name.toLowerCase() === detectedColor
            );

            // Try partial match (detected color contains our color name)
            if (!matchingColor) {
                matchingColor = colors.find(c =>
                    detectedColor.includes(c.name.toLowerCase())
                );
            }

            // Try reverse partial match (our color name contains detected color)
            if (!matchingColor) {
                matchingColor = colors.find(c =>
                    c.name.toLowerCase().includes(detectedColor)
                );
            }

            if (matchingColor) {
                console.log('Matched color:', matchingColor.name);
                setColorId(matchingColor.id);
                setColor(matchingColor.name);
            } else {
                console.log('No matching color found for:', detectedColor);
            }
        }
    }, [aiData, colors, colorId, color]);

    // Trigger Label Analysis when label image is uploaded
    useEffect(() => {
        if (labelImage && !isAnalyzingLabel && (!aiData?.verified)) {
            const analyzeLabel = async () => {
                setIsAnalyzingLabel(true);
                const result = await analyzeListingImage(labelImage, 'label');
                if (result && result.isAuthentic) {
                    setAiData(prev => ({
                        ...prev,
                        verified: true,
                        checks: result.checks // Overwrite with strict label checks
                    }));
                }
                setIsAnalyzingLabel(false);
            };
            analyzeLabel();
        }
    }, [labelImage, isAnalyzingLabel, aiData]);

    const handleGenerateDescription = async () => {
        if (!brand && !title) return;
        setIsGeneratingDesc(true);
        const desc = await generateListingDescription({
            brand: brand || 'Unknown Brand',
            color: color || 'Unknown Color',
            category: 'Item',
            title: title || 'Item',
            material: aiData?.material,
            style: aiData?.style,
            fit: aiData?.fit
        });
        if (desc) setDescription(desc);
        setIsGeneratingDesc(false);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        // Combine general images and label image if needed, or just store general
        // For now, we just store the general images array
        formData.set('images', JSON.stringify(images));

        // Append reference IDs if they exist and are not 'other'
        if (brandId && brandId !== 'other') formData.set('brandId', brandId);
        if (colorId) formData.set('colorId', colorId);
        if (sizeId) formData.set('sizeId', sizeId);

        if (aiData?.verified) {
            formData.set('verified', 'true');
            formData.set('aiConfidence', '0.99');
        }

        try {
            if (initialData) {
                formData.set('id', initialData.id);
                await updateListing(formData);
            } else {
                await createListing(formData);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to list item. Please try again.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{initialData ? 'Edit Item' : 'Sell an Item'}</h1>
                <p className={styles.subtitle}>{initialData ? 'Update your listing details.' : 'Upload photos and details to list your item.'}</p>
            </header>

            <form action={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Photos (Min 5)</h2>
                    <ImageUploader onImagesChange={setImages} initialImages={initialData ? JSON.parse(initialData.images) : undefined} />
                    {isAnalyzing && (
                        <div className={styles.aiStatus}>
                            <span className={styles.aiSpinner}>✨</span> Analyzing item details...
                        </div>
                    )}
                </div>

                {brand && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Authenticity Check 🛡️</h2>
                        <p className={styles.helperText}>To verify this <strong>{brand}</strong> item, please upload a clear photo of the inner care tag or brand label.</p>

                        <div className={styles.labelUpload}>
                            {!labelImage ? (
                                <label className={styles.uploadButton}>
                                    <span>📷 Upload Label/Tag</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setLabelImage(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        hidden
                                    />
                                </label>
                            ) : (
                                <div className={styles.labelPreview}>
                                    <img src={labelImage} alt="Label" className={styles.previewImg} />
                                    <button type="button" onClick={() => setLabelImage(null)} className={styles.removeBtn}>×</button>
                                </div>
                            )}
                        </div>

                        {isAnalyzingLabel && (
                            <div className={styles.aiStatus}>
                                <span className={styles.aiSpinner}>🔍</span> Verifying authenticity markers...
                            </div>
                        )}

                        {aiData?.verified && (
                            <div className={styles.aiReport}>
                                <div className={styles.aiSuccess}>
                                    <span className={styles.aiCheck}>🛡️</span> Authenticity Verified!
                                </div>
                                {aiData.checks && (
                                    <div className={styles.checksGrid}>
                                        {aiData.checks.map((check, i) => (
                                            <div key={i} className={styles.checkItem}>
                                                <span className={styles.checkIcon}>✓</span> {check.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Details</h2>

                    <div className={styles.inputGroup}>
                        <label htmlFor="title" className={styles.label}>Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className={styles.input}
                            placeholder="e.g. Vintage Denim Jacket"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Selection - CASCADE DROPDOWNS */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Category</h2>

                    {aiData?.gender && aiData?.category && (
                        <div className={styles.aiSuggestion} style={{
                            background: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px',
                            borderRadius: '8px', marginBottom: '16px', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between',
                            color: '#0f172a' // Force dark text for contrast
                        }}>
                            <div>
                                <span style={{ marginRight: '8px' }}>✨ AI Suggestion:</span>
                                <strong>{aiData.gender} &gt; {aiData.category} {aiData.itemType ? `> ${aiData.itemType}` : ''}</strong>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    // AI now returns exact keys, so we can set them directly
                                    const g = aiData.gender?.toLowerCase();
                                    const c = aiData.category?.toLowerCase();
                                    const t = aiData.itemType?.toLowerCase();

                                    if (g && ['men', 'women', 'kids'].includes(g)) {
                                        setGender(g);
                                        // Wait for state update or set dependent fields immediately?
                                        // React state updates are batched, so setting category immediately might rely on gender being set.
                                        // But since we control the inputs, we can set them all.

                                        if (c) setCategory(c);
                                        if (t) setItemType(t);
                                    }
                                }}
                                style={{
                                    background: '#0ea5e9', color: 'white', border: 'none',
                                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    {/* Gender Selection */}
                    <div className={styles.formGroup}>
                        <label htmlFor="gender" className={styles.label}>Gender / Audience *</label>
                        <select
                            id="gender"
                            name="gender"
                            className={styles.select}
                            required={!initialData} // Only required if new, or if we want to enforce re-selection
                            value={gender}
                            onChange={(e) => {
                                setGender(e.target.value);
                                setCategory('');
                                setItemType('');
                                setSubtype('');
                            }}
                        >
                            <option value="">Select gender/audience</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                            <option value="creators">Creators & Vintage</option>
                        </select>
                    </div>

                    {/* Category Selection - shows when gender selected */}
                    {gender && categories[gender as GenderKey] && (
                        <div className={styles.formGroup}>
                            <label htmlFor="category" className={styles.label}>Category *</label>
                            <select
                                id="category"
                                name="category"
                                className={styles.select}
                                required
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setItemType('');
                                    setSubtype('');
                                }}
                            >
                                <option value="">Select category</option>
                                {Object.entries(categories[gender as GenderKey].categories).map(([key, cat]) => (
                                    <option key={key} value={key}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Type Selection - shows when category selected */}
                    {category && gender && (
                        (() => {
                            const genderCat = categories[gender as GenderKey];
                            if (!genderCat) return null;
                            const selectedCat = genderCat.categories[category as keyof typeof genderCat.categories] as any;
                            if (selectedCat && selectedCat.types) {
                                return (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="itemType" className={styles.label}>Type *</label>
                                        <select
                                            id="itemType"
                                            name="itemType"
                                            className={styles.select}
                                            required
                                            value={itemType}
                                            onChange={(e) => {
                                                setItemType(e.target.value);
                                                setSubtype('');
                                            }}
                                        >
                                            <option value="">Select type</option>
                                            {Object.entries(selectedCat.types).map(([key, type]: [string, any]) => (
                                                <option key={key} value={key}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            }
                            return null;
                        })()
                    )}

                    {/* Subtype Selection - shows when type has subtypes */}
                    {itemType && gender && category && (
                        (() => {
                            const genderCat = categories[gender as GenderKey];
                            if (!genderCat) return null;
                            const selectedCat = genderCat.categories[category as keyof typeof genderCat.categories] as any;
                            if (selectedCat && selectedCat.types) {
                                const selectedType = selectedCat.types[itemType] as any;
                                if (selectedType && selectedType.subtypes) {
                                    return (
                                        <div className={styles.formGroup}>
                                            <label htmlFor="subtype" className={styles.label}>Subtype (Optional)</label>
                                            <select
                                                id="subtype"
                                                name="subtype"
                                                className={styles.select}
                                                value={subtype}
                                                onChange={(e) => setSubtype(e.target.value)}
                                            >
                                                <option value="">Select subtype (optional)</option>
                                                {selectedType.subtypes.map((sub: string) => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }
                            }
                            return null;
                        })()
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Details</h2>
                    <div className={styles.formGroup}>
                        <label htmlFor="brand" className={styles.label}>Brand *</label>
                        <div className={styles.inputWrapper}>
                            <select
                                id="brand"
                                name="brand"
                                className={styles.select}
                                required
                                value={brandId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setBrandId(selectedId);
                                    if (selectedId === 'other') {
                                        setBrand('');
                                    } else if (selectedId) {
                                        const selectedBrand = brands.find(b => b.id === selectedId);
                                        if (selectedBrand) setBrand(selectedBrand.name);
                                    }
                                }}
                            >
                                <option value="">Select a brand</option>
                                <optgroup label="Popular Brands">
                                    {brands.filter(b => b.verified).slice(0, 20).map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} {b.verified ? '✓' : ''}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="All Brands">
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <option value="other">✏️ Other (type custom brand)</option>
                            </select>
                            {aiData?.verified && aiData.brand === brand && (
                                <span className={styles.verifiedBadge} title="Verified by AI">🛡️</span>
                            )}
                        </div>
                        {brandId === 'other' && (
                            <input
                                type="text"
                                placeholder="Enter custom brand name"
                                className={styles.input}
                                value={customBrand}
                                onChange={(e) => {
                                    setCustomBrand(e.target.value);
                                    setBrand(e.target.value);
                                }}
                                style={{ marginTop: '8px' }}
                            />
                        )}
                        {aiData && aiData.brand !== brand && (
                            <p className={styles.helperText} style={{ color: '#f59e0b', marginTop: 4 }}>
                                ⚠️ AI detected "{aiData.brand}". If this is incorrect, please correct it above.
                            </p>
                        )}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label htmlFor="size" className={styles.label}>Size *</label>
                            <select
                                id="size"
                                name="size"
                                className={styles.select}
                                required
                                value={sizeId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setSizeId(selectedId);
                                    if (selectedId) {
                                        const selectedSize = sizes.find(s => s.id === selectedId);
                                        if (selectedSize) setSize(selectedSize.value + ' ' + selectedSize.system);
                                    }
                                }}
                                disabled={!category}
                            >
                                <option value="">{category ? 'Select size' : 'Select category first'}</option>
                                {/* Group by System */}
                                {['INT', 'EU', 'US', 'UK'].map(system => {
                                    const systemSizes = sizes.filter(s => s.system === system);
                                    if (systemSizes.length === 0) return null;
                                    return (
                                        <optgroup key={system} label={`${system} Sizes`}>
                                            {systemSizes.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.value}
                                                </option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                                {/* Other systems */}
                                <optgroup label="Other">
                                    {sizes.filter(s => !['INT', 'EU', 'US', 'UK'].includes(s.system)).map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.value} ({s.system})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="color" className={styles.label}>Color *</label>
                            <select
                                id="color"
                                name="color"
                                className={styles.select}
                                required
                                value={colorId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setColorId(selectedId);
                                    if (selectedId) {
                                        const selectedColor = colors.find(c => c.id === selectedId);
                                        if (selectedColor) setColor(selectedColor.name);
                                    }
                                }}
                            >
                                <option value="">Select color</option>
                                <optgroup label="Primary Colors">
                                    {colors.filter(c => c.category === 'primary').map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Neutral Colors">
                                    {colors.filter(c => c.category === 'neutral').map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Other Colors">
                                    {colors.filter(c => !['primary', 'neutral'].includes(c.category)).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="condition" className={styles.label}>Condition</label>
                        <select
                            id="condition"
                            name="condition"
                            className={styles.select}
                            required
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="">Select condition</option>
                            <option value="New with tags">New with tags</option>
                            <option value="New without tags">New without tags</option>
                            <option value="Very good">Very good</option>
                            <option value="Good">Good</option>
                            <option value="Satisfactory">Satisfactory</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label htmlFor="description" className={styles.label}>Description</label>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                className={styles.aiGenButton}
                                disabled={isGeneratingDesc || !brand}
                            >
                                {isGeneratingDesc ? '✨ Writing...' : '✨ Generate with AI'}
                            </button>
                        </div>
                        <textarea
                            id="description"
                            name="description"
                            required
                            className={styles.textarea}
                            placeholder="Describe your item..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Price</h2>
                    <div className={styles.inputGroup}>
                        <label htmlFor="price" className={styles.label}>Price (MAD)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className={styles.input}
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className={`btn btn - primary ${styles.submitButton} `}
                    disabled={isSubmitting || images.length < 5}
                >
                    {isSubmitting ? (initialData ? 'Updating Item...' : 'Listing Item...') : (initialData ? 'Update Item' : 'List Item')}
                </button>
            </form>
        </div>
    );
}
