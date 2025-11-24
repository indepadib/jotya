'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateProfile, changePassword } from '@/app/actions/profile';
import { logout } from '@/app/actions/auth';
import TopNav from '@/components/Layout/TopNav';
import styles from './settings.module.css';

interface SettingsViewProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

export default function SettingsView({ user }: SettingsViewProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Profile State
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email);
    const [image, setImage] = useState<string | null>(user.image);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (image) formData.append('avatar', image);

        const result = await updateProfile(formData);

        setProfileLoading(false);
        if (result?.error) {
            setProfileMessage({ type: 'error', text: result.error });
        } else {
            setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            setPasswordLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);

        const result = await changePassword(formData);

        setPasswordLoading(false);
        if (result?.error) {
            setPasswordMessage({ type: 'error', text: result.error });
        } else {
            setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className={styles.container}>
            <TopNav title="Settings" showBack={true} />

            <div className={styles.content}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className={styles.card}>
                        <form onSubmit={handleProfileUpdate} className={styles.form}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatarWrapper}>
                                    {image ? (
                                        <img src={image} alt="Profile" className={styles.avatarImage} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <label className={styles.editAvatarButton}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                    </label>
                                </div>
                                <p className={styles.avatarHint}>Tap to change photo</p>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="your@email.com"
                                />
                            </div>

                            {profileMessage.text && (
                                <div className={`${styles.message} ${styles[profileMessage.type]}`}>
                                    {profileMessage.text}
                                </div>
                            )}

                            <button type="submit" disabled={profileLoading} className={styles.submitButton}>
                                {profileLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className={styles.card}>
                        <form onSubmit={handlePasswordChange} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>

                            {passwordMessage.text && (
                                <div className={`${styles.message} ${styles[passwordMessage.type]}`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <button type="submit" disabled={passwordLoading} className={styles.submitButton}>
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}

                <button onClick={() => logout()} className={styles.logoutButton}>
                    Log Out
                </button>
            </div>
        </div>
    );
}
