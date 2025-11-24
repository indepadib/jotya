// Vinted-style category structure: Gender → Category → Type → Subtypes
export const categories = {
    men: {
        name: "Men",
        categories: {
            all: { name: "All" },
            clothes: {
                name: "Clothes",
                types: {
                    all: { name: "All" },
                    jeans: { name: "Jeans", subtypes: ["Slim", "Regular", "Relaxed", "Skinny", "Bootcut"] },
                    coats: { name: "Coats & Jackets", subtypes: ["Leather Jacket", "Bomber", "Parka", "Blazer", "Trench Coat", "Denim Jacket"] },
                    tshirts: { name: "T-Shirts", subtypes: ["Polo", "Crew Neck", "V-Neck", "Long Sleeve", "Graphic"] },
                    blazers: { name: "Blazers", subtypes: ["Single Breasted", "Double Breasted", "Casual", "Formal"] },
                    suits: { name: "Suits", subtypes: ["Two Piece", "Three Piece", "Tuxedo"] },
                    sweats: { name: "Sweats", subtypes: ["Hoodies", "Sweatshirts", "Track Suits", "Joggers"] },
                    pants: { name: "Pants", subtypes: ["Chinos", "Dress Pants", "Cargo", "Corduroys"] },
                    shorts: { name: "Shorts", subtypes: ["Denim", "Athletic", "Casual", "Dress Shorts"] },
                    underwear: { name: "Underwear", subtypes: ["Boxers", "Briefs", "Boxer Briefs", "Compression"] },
                    pyjamas: { name: "Pyjamas", subtypes: ["Sets", "Bottoms", "Tops", "Robes"] },
                    swimwear: { name: "Bathing Suits", subtypes: ["Swim Shorts", "Board Shorts", "Swimming Trunks"] },
                    sportswear: { name: "Sports Clothes", subtypes: ["Athletic Tops", "Athletic Bottoms", "Gym Wear", "Running Gear"] },
                    others: { name: "Others" }
                }
            },
            shoes: {
                name: "Shoes",
                types: {
                    all: { name: "All" },
                    sneakers: { name: "Sneakers", subtypes: ["Low Top", "High Top", "Slip-On", "Running"] },
                    boots: { name: "Boots", subtypes: ["Chelsea", "Desert", "Work Boots", "Winter Boots"] },
                    formal: { name: "Formal Shoes", subtypes: ["Oxford", "Derby", "Loafers", "Monk Strap"] },
                    sandals: { name: "Sandals & Slides" },
                    others: { name: "Others" }
                }
            },
            accessories: {
                name: "Accessories",
                types: {
                    all: { name: "All" },
                    bags: { name: "Bags", subtypes: ["Backpacks", "Messenger Bags", "Duffle Bags", "Briefcases"] },
                    watches: { name: "Watches" },
                    sunglasses: { name: "Sunglasses" },
                    belts: { name: "Belts" },
                    hats: { name: "Hats & Caps", subtypes: ["Baseball Caps", "Beanies", "Fedoras", "Bucket Hats"] },
                    wallets: { name: "Wallets" },
                    jewelry: { name: "Jewelry", subtypes: ["Bracelets", "Necklaces", "Rings"] },
                    others: { name: "Others" }
                }
            },
            care: {
                name: "Care",
                types: {
                    all: { name: "All" },
                    grooming: { name: "Grooming" },
                    skincare: { name: "Skincare" },
                    fragrance: { name: "Fragrance" }
                }
            }
        }
    },
    women: {
        name: "Women",
        categories: {
            all: { name: "All" },
            clothes: {
                name: "Clothes",
                types: {
                    all: { name: "All" },
                    jeans: { name: "Jeans", subtypes: ["Skinny", "Straight", "Bootcut", "Flare", "Mom Jeans", "Boyfriend"] },
                    coats: { name: "Coats & Jackets", subtypes: ["Leather Jacket", "Blazer", "Trench Coat", "Parka", "Bomber", "Cardigan Coat"] },
                    dresses: { name: "Dresses", subtypes: ["Maxi", "Midi", "Mini", "Casual", "Formal", "Party"] },
                    tops: { name: "Tops", subtypes: ["Blouses", "T-Shirts", "Crop Tops", "Tank Tops", "Tunics", "Bodysuits"] },
                    skirts: { name: "Skirts", subtypes: ["Mini", "Midi", "Maxi", "Pencil", "A-Line", "Pleated"] },
                    pants: { name: "Pants", subtypes: ["Dress Pants", "Leggings", "Wide Leg", "Palazzo", "Culottes"] },
                    shorts: { name: "Shorts", subtypes: ["Denim", "Casual", "Athletic", "High Waisted"] },
                    sweaters: { name: "Sweaters", subtypes: ["Cardigans", "Pullovers", "Hoodies", "Sweater Dresses"] },
                    underwear: { name: "Underwear & Lingerie" },
                    pyjamas: { name: "Pyjamas & Loungewear" },
                    swimwear: { name: "Bathing Suits", subtypes: ["One Piece", "Bikini", "Tankini", "Cover Ups"] },
                    sportswear: { name: "Sports Clothes", subtypes: ["Sports Bras", "Leggings", "Athletic Tops", "Yoga Wear"] },
                    others: { name: "Others" }
                }
            },
            shoes: {
                name: "Shoes",
                types: {
                    all: { name: "All" },
                    sneakers: { name: "Sneakers" },
                    heels: { name: "Heels", subtypes: ["Pumps", "Stilettos", "Block Heels", "Kitten Heels"] },
                    boots: { name: "Boots", subtypes: ["Ankle Boots", "Knee High", "Over the Knee", "Chelsea"] },
                    flats: { name: "Flats", subtypes: ["Ballet Flats", "Loafers", "Mules"] },
                    sandals: { name: "Sandals", subtypes: ["Flat Sandals", "Wedges", "Gladiator"] },
                    others: { name: "Others" }
                }
            },
            accessories: {
                name: "Accessories",
                types: {
                    all: { name: "All" },
                    bags: { name: "Bags", subtypes: ["Handbags", "Crossbody", "Clutches", "Totes", "Backpacks", "Belt Bags"] },
                    jewelry: { name: "Jewelry", subtypes: ["Necklaces", "Earrings", "Bracelets", "Rings", "Watches"] },
                    sunglasses: { name: "Sunglasses" },
                    scarves: { name: "Scarves & Shawls" },
                    hats: { name: "Hats" },
                    belts: { name: "Belts" },
                    others: { name: "Others" }
                }
            },
            care: {
                name: "Care & Beauty",
                types: {
                    all: { name: "All" },
                    makeup: { name: "Makeup" },
                    skincare: { name: "Skincare" },
                    haircare: { name: "Hair Care" },
                    fragrance: { name: "Fragrance" }
                }
            }
        }
    },
    kids: {
        name: "Kids",
        categories: {
            all: { name: "All" },
            clothes: {
                name: "Clothes",
                types: {
                    all: { name: "All" },
                    tops: { name: "Tops & T-Shirts" },
                    bottoms: { name: "Pants & Shorts" },
                    dresses: { name: "Dresses & Skirts" },
                    outerwear: { name: "Coats & Jackets" },
                    sleepwear: { name: "Pyjamas" },
                    swimwear: { name: "Swimwear" },
                    others: { name: "Others" }
                }
            },
            shoes: {
                name: "Shoes",
                types: {
                    all: { name: "All" },
                    sneakers: { name: "Sneakers" },
                    boots: { name: "Boots" },
                    sandals: { name: "Sandals" },
                    others: { name: "Others" }
                }
            },
            accessories: {
                name: "Accessories",
                types: {
                    all: { name: "All" },
                    bags: { name: "Bags & Backpacks" },
                    hats: { name: "Hats" },
                    others: { name: "Others" }
                }
            }
        }
    },
    creators: {
        name: "Creators & Vintage",
        categories: {
            all: { name: "All Collections" },
            vintage: { name: "Vintage Items" },
            handmade: { name: "Handmade" },
            limited: { name: "Limited Edition" }
        }
    }
};

export type GenderKey = keyof typeof categories;
