
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
    const [images, setImages] = useState<string[]>(initialData ? JSON.parse(initialData.images) : []);
    const [labelImage, setLabelImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalyzingLabel, setIsAnalyzingLabel] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [aiData, setAiData] = useState<{
        brand?: string;
        color?: string;
        verified?: boolean;
        checks?: { name: string; passed: boolean }[];
        material?: string;
        style?: string;
        fit?: string;
    } | null>(initialData ? {
        brand: initialData.brand || undefined,
        color: initialData.color || undefined,
        verified: initialData.verified,
    } : null);

    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [brand, setBrand] = useState(initialData?.brand || '');
    const [color, setColor] = useState(initialData?.color || '');
    const [size, setSize] = useState(initialData?.size || '');
    const [condition, setCondition] = useState(initialData?.condition || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(initialData?.price.toString() || '');

    // Category state (We don't have this in initialData yet, so user might need to re-select or we infer)
    // For MVP edit, we might leave these empty or try to infer from title/description if possible.
    // Ideally we should store category fields in DB. For now, user re-selects if they want to change.
    const [gender, setGender] = useState('');
    const [category, setCategory] = useState('');
    const [itemType, setItemType] = useState('');
    const [subtype, setSubtype] = useState('');

    // Trigger AI analysis when the first image is uploaded (General Analysis)
    useEffect(() => {
        if (images.length > 0 && !aiData && !isAnalyzing && !initialData) {
            const analyze = async () => {
                setIsAnalyzing(true);
                // Use the first image for analysis
                const result = await analyzeListingImage(images[0], 'general');
                if (result) {
                    setAiData(prev => ({
                        ...prev,
                        brand: result.brand,
                        color: result.color,
                        material: result.material,
                        style: result.style,
                        fit: result.fit,
                        // Keep existing checks if any, or use general ones
                        checks: prev?.checks || result.checks
                    }));

                    // Auto-fill if empty
                    if (!brand && result.brand) setBrand(result.brand);
                    if (!color && result.color) setColor(result.color);
                    if (!title) {
                        const richTitle = `${result.brand || ''} ${result.style || result.category || 'Item'} - ${result.color || ''} ${result.fit ? `(${result.fit})` : ''}`;
                        setTitle(richTitle.trim());
                    }
                }
                setIsAnalyzing(false);
            };
            analyze();
        }
    }, [images, aiData, isAnalyzing, brand, color, title, initialData]);

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
        if (aiData?.verified) {
            formData.set('verified', 'true');
            formData.set('aiConfidence', '0.99');
        }

        if (initialData) {
            formData.set('id', initialData.id);
            await updateListing(formData);
        } else {
            await createListing(formData);
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
                        <label htmlFor="brand" className={styles.label}>Brand</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                className={styles.input}
                                placeholder="e.g. Zara, H&M"
                                value={brand}
                                onChange={(e) => {
                                    setBrand(e.target.value);
                                    // If user manually changes brand, we should probably reset verification
                                    // unless they re-verify with the label
                                    if (aiData?.verified && e.target.value !== aiData.brand) {
                                        setAiData(prev => prev ? ({ ...prev, verified: false }) : null);
                                    }
                                }}
                            />
                            {aiData?.verified && aiData.brand === brand && (
                                <span className={styles.verifiedBadge} title="Verified by AI">🛡️</span>
                            )}
                        </div>
                        {aiData && aiData.brand !== brand && (
                            <p className={styles.helperText} style={{ color: '#f59e0b', marginTop: 4 }}>
                                ⚠️ AI detected "{aiData.brand}". If this is incorrect, please correct it above.
                            </p>
                        )}
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label htmlFor="size" className={styles.label}>Size</label>
                            <input
                                type="text"
                                id="size"
                                name="size"
                                className={styles.input}
                                placeholder="e.g. M, 38"
                                required
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="color" className={styles.label}>Color</label>
                            <input
                                type="text"
                                id="color"
                                name="color"
                                className={styles.input}
                                placeholder="e.g. Black, Red"
                                required
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
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
