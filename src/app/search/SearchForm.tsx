'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchListings, toggleFavorite } from '@/app/actions/search';
import Link from 'next/link';
import VisualCategoryBrowser from './VisualCategoryBrowser';
import styles from './search.module.css';

export default function SearchForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [categoryPath, setCategoryPath] = useState<string[]>([]);

    // Reference Data
    const [brands, setBrands] = useState<{ id: string; name: string; verified: boolean }[]>([]);
    const [colors, setColors] = useState<{ id: string; name: string; hexCode: string; category: string }[]>([]);
    const [sizes, setSizes] = useState<{ id: string; value: string; system: string }[]>([]);

    // Filters
    const [brand, setBrand] = useState(searchParams.get('brand') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [condition, setCondition] = useState(searchParams.get('condition') || '');
    const [size, setSize] = useState(searchParams.get('size') || '');
    const [color, setColor] = useState(searchParams.get('color') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

    // Category Filters
    const [gender, setGender] = useState(searchParams.get('gender') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [itemType, setItemType] = useState(searchParams.get('itemType') || '');
    const [subtype, setSubtype] = useState(searchParams.get('subtype') || '');

    const handleCategorySelect = (path: string[]) => {
        setCategoryPath(path);

        // Reset all category fields first
        setGender('');
        setCategory('');
        setItemType('');
        setSubtype('');

        // Map path to fields based on index
        if (path.length > 0) setGender(path[0]);
        if (path.length > 1) setCategory(path[1]);
        if (path.length > 2) setItemType(path[2]);
        if (path.length > 3) setSubtype(path[3]);

        setShowCategories(false);
        setShowCategories(false);
    };

    // Fetch reference data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [brandsRes, colorsRes] = await Promise.all([
                    fetch('/api/brands'),
                    fetch('/api/colors')
                ]);

                if (brandsRes.ok) setBrands(await brandsRes.json());
                if (colorsRes.ok) setColors(await colorsRes.json());
            } catch (error) {
                console.error('Error fetching reference data:', error);
            }
        };
        fetchData();
    }, []);

    // Fetch sizes when category changes
    useEffect(() => {
        const fetchSizes = async () => {
            // Determine size category mapping
            let sizeCategory = 'clothing';
            if (category === 'shoes') sizeCategory = 'shoes';
            if (category === 'accessories') sizeCategory = 'accessories';
            if (category === 'clothes') sizeCategory = 'clothing';

            const params = new URLSearchParams({ category: sizeCategory });
            if (gender) params.set('gender', gender);
            // We don't filter by itemType here to show all relevant sizes for the category

            try {
                const res = await fetch(`/api/sizes?${params}`);
                if (res.ok) setSizes(await res.json());
            } catch (error) {
                console.error('Error fetching sizes:', error);
            }
        };
        fetchSizes();
    }, [category, gender]);

    const fetchResults = async () => {
        setLoading(true);
        const filters = {
            query,
            brand,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            condition,
            size,
            color,
            gender,
            category,
            itemType,
            subtype,
            sortBy
        };
        const data = await searchListings(filters);
        setResults(data);
        setLoading(false);
    };

    // Debounce search or fetch on mount
    useEffect(() => {
        // Only fetch if there's a query or active filters
        if (!query && !brand && !minPrice && !maxPrice && !condition && !size && !color && !gender && !category && !itemType && !subtype) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            fetchResults();
        }, 500);
        return () => clearTimeout(timer);
    }, [query, brand, minPrice, maxPrice, condition, size, color, sortBy, gender, category, itemType, subtype]);

    const handleFavorite = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleFavorite(id);
        // Optimistic update
        setResults(prev => prev.map(item =>
            item.id === id ? { ...item, isFavorited: !item.isFavorited } : item
        ));
    };

    const updateUrl = () => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (brand) params.set('brand', brand);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (condition) params.set('condition', condition);
        if (size) params.set('size', size);
        if (color) params.set('color', color);
        if (sortBy) params.set('sortBy', sortBy);

        if (gender) params.set('gender', gender);
        if (category) params.set('category', category);
        if (itemType) params.set('itemType', itemType);
        if (subtype) params.set('subtype', subtype);

        router.replace(`/search?${params.toString()}`);
        setShowFilters(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchBar}>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search items, brands..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn} onClick={() => setShowFilters(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Category Dropdown - appears under search bar */}
                {showCategories && (
                    <VisualCategoryBrowser
                        onCategorySelect={handleCategorySelect}
                        onClose={() => setShowCategories(false)}
                    />
                )}

                {/* Active Filters Chips */}
                {(brand || minPrice || maxPrice || condition) && (
                    <div className={styles.activeFilters}>
                        {brand && <span className={styles.filterChip}>{brand} <button onClick={() => setBrand('')} className={styles.removeFilter}>×</button></span>}
                        {condition && <span className={styles.filterChip}>{condition} <button onClick={() => setCondition('')} className={styles.removeFilter}>×</button></span>}
                        {(minPrice || maxPrice) && <span className={styles.filterChip}>{minPrice}-{maxPrice} MAD <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className={styles.removeFilter}>×</button></span>}
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : results.length > 0 ? (
                <div className={styles.resultsGrid}>
                    {results.map(item => (
                        <Link href={`/items/${item.id}`} key={item.id} className={styles.itemCard}>
                            <img src={JSON.parse(item.images)[0]} alt={item.title} className={styles.itemImage} />
                            <button
                                className={styles.favButton}
                                onClick={(e) => handleFavorite(e, item.id)}
                            >
                                {item.isFavorited ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                            <div className={styles.itemInfo}>
                                <div className={styles.itemPrice}>{item.price} MAD</div>
                                <div className={styles.itemBrand}>{item.displayBrand || item.brand}</div>
                                <div className={styles.itemSize}>{item.displaySize || item.size}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (query || gender || category || itemType || subtype || brand || condition || minPrice || maxPrice) ? (
                // Only show "no results" if there's an actual search/filter active
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No items found</h3>
                    <p style={{ marginBottom: '24px' }}>Try adjusting your search or filters to find what you're looking for.</p>
                    <button
                        onClick={() => {
                            setQuery('');
                            setBrand('');
                            setMinPrice('');
                            setMaxPrice('');
                            setCondition('');
                            setGender('');
                            setCategory('');
                            setItemType('');
                            setSubtype('');
                            router.replace('/search');
                        }}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        Clear Search & Filters
                    </button>
                </div>
            ) : (
                // Show category browser when nothing is selected
                <VisualCategoryBrowser onCategorySelect={handleCategorySelect} />
            )
            }

            {/* Filter Drawer */}
            <div className={`${styles.overlay} ${showFilters ? styles.open : ''}`} onClick={() => setShowFilters(false)} />
            <div className={`${styles.filterDrawer} ${showFilters ? styles.open : ''}`}>
                <div className={styles.drawerHeader}>
                    <h2 className={styles.drawerTitle}>Filters</h2>
                    <button className={styles.closeBtn} onClick={() => setShowFilters(false)}>×</button>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Brand</label>
                    <select
                        className={styles.filterInput}
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    >
                        <option value="">Any Brand</option>
                        <optgroup label="Popular Brands">
                            {brands.filter(b => b.verified).slice(0, 20).map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="All Brands">
                            {brands.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Condition</label>
                    <select
                        className={styles.filterInput}
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="New with tags">New with tags</option>
                        <option value="Very Good">Very Good</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                    </select>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Price Range</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="number"
                            className={styles.filterInput}
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                            type="number"
                            className={styles.filterInput}
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Size</label>
                    <select
                        className={styles.filterInput}
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                    >
                        <option value="">Any Size</option>
                        {sizes.map(s => (
                            <option key={s.id} value={s.value + ' ' + s.system}>
                                {s.value} ({s.system})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Color</label>
                    <select
                        className={styles.filterInput}
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    >
                        <option value="">Any Color</option>
                        <optgroup label="Primary Colors">
                            {colors.filter(c => c.category === 'primary').map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Neutral Colors">
                            {colors.filter(c => c.category === 'neutral').map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Other Colors">
                            {colors.filter(c => !['primary', 'neutral'].includes(c.category)).map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </optgroup>
                    </select>
                </div>

                <div className={styles.filterSection}>
                    <label className={styles.filterLabel}>Sort By</label>
                    <select
                        className={styles.filterInput}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                <button className={styles.applyBtn} onClick={updateUrl}>
                    Show Results
                </button>
            </div>
        </div >
    );
}
