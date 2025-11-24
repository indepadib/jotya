'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';
import styles from '@/app/profile/profile.module.css';

interface EditProfileModalProps {
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
    onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email);
    const [image, setImage] = useState<string | null>(user.image);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (image) formData.append('avatar', image); // Action expects 'avatar' key for the file data, mapped to 'image' field

        const result = await updateProfile(formData);

        setIsLoading(false);
        if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Edit Profile</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.avatarUpload}>
                        <div className={styles.avatarPreview}>
                            {image ? (
                                <img src={image} alt="Profile" />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className={styles.uploadButton}>
                            Change Photo
                            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                        <button type="submit" disabled={isLoading} className={styles.saveButton}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
