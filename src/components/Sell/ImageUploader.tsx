'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
    onImagesChange: (images: string[]) => void;
    initialImages?: string[];
}

export default function ImageUploader({ onImagesChange, initialImages }: ImageUploaderProps) {
    const [previews, setPreviews] = useState<string[]>(initialImages || []);

    // Sync with parent when initialImages change
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setPreviews(initialImages);
        }
    }, [initialImages]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPreviews: string[] = [];
        const readers: FileReader[] = [];

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            readers.push(reader);
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    newPreviews.push(reader.result);
                    if (newPreviews.length === files.length) {
                        const updatedPreviews = [...previews, ...newPreviews];
                        setPreviews(updatedPreviews);
                        onImagesChange(updatedPreviews);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
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

                <label className={styles.uploadButton}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />
                    <span className={styles.plusIcon}>+</span>
                    <span className={styles.uploadText}>Add Photos</span>
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
