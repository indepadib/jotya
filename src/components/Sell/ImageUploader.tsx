'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
    onImagesChange: (images: string[]) => void;
    initialImages?: string[];
}

export default function ImageUploader({ onImagesChange, initialImages }: ImageUploaderProps) {
    const [previews, setPreviews] = useState<string[]>(initialImages || []);
    const [uploading, setUploading] = useState(false);

    // Sync with parent when initialImages change
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setPreviews(initialImages);
        }
    }, [initialImages]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newUrls: string[] = [];

        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('jotya-images')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    continue;
                }

                const { data } = supabase.storage
                    .from('jotya-images')
                    .getPublicUrl(filePath);

                if (data) {
                    newUrls.push(data.publicUrl);
                }
            }

            const updatedPreviews = [...previews, ...newUrls];
            setPreviews(updatedPreviews);
            onImagesChange(updatedPreviews);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setPreviews(updatedPreviews);
        onImagesChange(updatedPreviews);
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {previews.map((src, index) => (
                    <div key={index} className={styles.previewWrapper}>
                        <img src={src} alt={`Preview ${index}`} className={styles.preview} />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className={styles.removeBtn}
                        >
                            ×
                        </button>
                    </div>
                ))}

                <label className={`${styles.uploadButton} ${uploading ? styles.disabled : ''}`}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                        disabled={uploading}
                    />
                    {uploading ? (
                        <span className={styles.uploadText}>Uploading...</span>
                    ) : (
                        <>
                            <span className={styles.plusIcon}>+</span>
                            <span className={styles.uploadText}>Add Photos</span>
                        </>
                    )}
                </label>
            </div>
            <p className={styles.hint}>
                {previews.length < 5
                    ? `Add ${5 - previews.length} more photos to continue`
                    : 'Great! You have enough photos.'}
            </p>
        </div>
    );
}
