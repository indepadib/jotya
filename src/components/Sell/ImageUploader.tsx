'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
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
            const compressionOptions = {
                maxSizeMB: 0.2,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/jpeg'
            };

            for (const file of Array.from(files)) {
                // Compress image
                const compressedFile = await imageCompression(file, compressionOptions);

                const fileExt = 'jpg'; // Always use jpg after compression
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('jotya-images')
                    .upload(filePath, compressedFile);

                if (uploadError) {
                    console.error('Supabase upload failed, falling back to Base64:', uploadError);
                    // Fallback: Convert to Base64
                    const base64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(compressedFile);
                    });
                    newUrls.push(base64);
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
            alert('Image processing failed. Please try again.');
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
