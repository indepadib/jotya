'use client';

import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useState } from 'react';
import styles from './Discover.module.css';

interface SwipeCardProps {
    item: any;
    onSwipe: (direction: 'left' | 'right') => void;
    style?: React.CSSProperties;
}

export default function SwipeCard({ item, onSwipe, style }: SwipeCardProps) {
    const controls = useAnimation();
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Color overlays for feedback
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    const handleDragEnd = async (event: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset > 100 || velocity > 500) {
            await controls.start({ x: 500, opacity: 0 });
            onSwipe('right');
        } else if (offset < -100 || velocity < -500) {
            await controls.start({ x: -500, opacity: 0 });
            onSwipe('left');
        } else {
            controls.start({ x: 0 });
        }
    };

    const images = JSON.parse(item.images);

    return (
        <motion.div
            className={styles.card}
            style={{ x, rotate, opacity, ...style }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileTap={{ scale: 1.05 }}
        >
            <div className={styles.imageContainer}>
                <img src={images[0]} alt={item.title} className={styles.image} draggable="false" />

                {/* Like Overlay */}
                <motion.div className={styles.overlayLike} style={{ opacity: likeOpacity }}>
                    LIKE
                </motion.div>

                {/* Nope Overlay */}
                <motion.div className={styles.overlayNope} style={{ opacity: nopeOpacity }}>
                    NOPE
                </motion.div>

                <div className={styles.info}>
                    <h3 className={styles.title}>{item.title}</h3>
                    <p className={styles.brand}>{item.brand}</p>
                    <p className={styles.price}>{item.price} MAD</p>
                </div>
            </div>
        </motion.div>
    );
}
