# Jotya UX Overhaul - Handoff Document

## Current Status
We are in Phase VIII of the Jotya marketplace development, focused on comprehensive UX improvements with premium animations and world-class user experience.

---

## ✅ Completed Work

### Design System (Phase VII)
- **Moroccan-inspired color palette**: Terracotta (#C4785A), Gold (#D4A574), Deep Blue, Warm Sand
- **Premium typography**: Playfair Display (headings) + Inter (body)
- **Enhanced globals.css**: New CSS variables, animation utilities, premium interactions

### Navigation System (Phase VIII)
- **TopNav Component**: Sticky header with back button, logo, menu trigger
- **Menu Drawer**: Slide-in menu with smooth animations, account links, logout
- Files: `src/components/Layout/TopNav.tsx`, `Menu.tsx` + .module.css

### Enhanced Landing Page (Phase VIII)
- **7 Sections**: Hero (animated), How It Works, Live Stats (counters), Featured Items, Trust Badges, CTA Footer
- **Animations**: Scroll-triggered counters, fade-in effects, geometric patterns
- Files: `src/app/LandingPage.tsx`, `page.module.css`

### Profile Page Redesign (Phase VIII - JUST COMPLETED)
- **KPI Dashboard**: 4 metric boxes (Wallet, Listings, Sales, Revenue)
- **Quick Actions Grid**: Links to Sell, Purchases, Favorites, Messages
- **Listings Preview**: Shows user's 3 most recent listings
- **Account Settings**: Email, notifications, privacy, logout
- Files: `src/app/profile/page.tsx`, `profile.module.css`

---

## 🚧 Remaining Work (Critical Pages)

### 1. Inbox Page Redesign
**Current Issue**: "Too empty" - no content structure
**Requirements**:
- Conversation list with avatars, last message preview
- Unread message indicators
- Empty state when no messages
- Message thread view (tap to expand)
- Premium design matching new system

**Suggested Structure**:
```
TopNav (title: "Messages")
├── Conversation List
│   ├── User Avatar + Name
│   ├── Last Message Preview
│   ├── Timestamp
│   └── Unread Badge
└── Empty State (if no messages)
```

### 2. Search Page with Nested Categories
**Current Issue**: No category system like Vinted
**Requirements**:
- **Category Hierarchy**: Main Category → Subcategory → Sub-subcategory
- Example: "Clothing" → "Women" → "Dresses" → "Evening Dresses"
- Filter by brand, price, condition, size
- Visual category cards with icons
- Breadcrumb navigation

**Suggested Categories**:
```
👗 Women's Fashion
   ├── Tops
   ├── Dresses
   ├── Shoes
   └── Accessories

👔 Men's Fashion  
   ├── Shirts
   ├── Pants
   ├── Shoes
   └── Accessories

👜 Bags & Accessories
   ├── Handbags
   ├── Backpacks
   └── Wallets
```

### 3. Item Detail Page - Complete Overhaul
**Current Issue**: "Not original, not selling, don't like it at all"
**Requirements**:
- **Hero Section**: Large swipeable image gallery (full-width)
- **Price & CTA**: Sticky bottom bar with "Buy Now" + "Message Seller"
- **Product Info Grid**: Brand, Size, Condition, Color in boxes
- **Description**: Expandable section
- **Seller Card**: Avatar, name, rating, "View Profile" link
- **AI Verification Badge**: Prominent display if verified
- **Similar Items**: Carousel at bottom
- **More Info**: Material, measurements, shipping details

**Layout Inspiration**:
```
┌─────────────────────────┐
│  Image Gallery (swipe)  │ ← Full-width hero
├─────────────────────────┤
│  Brand • Verified 🛡️    │
│  Item Title             │
│  999 MAD                │ ← Large serif font
├─────────────────────────┤
│  [Size] [Condition]     │ ← Info chips
│  [Color] [Material]     │
├─────────────────────────┤
│  Description ▼          │ ← Expandable
├─────────────────────────┤
│  Seller Card            │ ← Rating, avatar
├─────────────────────────┤
│  Similar Items →        │ ← Horizontal scroll
├─────────────────────────┤
│  [Message] [Buy Now]    │ ← Sticky bottom
└─────────────────────────┘
```

---

## Technical Context

### Database
- **Provider**: PostgreSQL (Supabase)
- **Schema**: `prisma/schema.prisma` includes User, Listing, Transaction, Message, Favorite, Review, Wallet

### Key Files to Modify
1. `src/app/inbox/page.tsx` - Create new
2. `src/app/search/page.tsx` - Complete overhaul with categories
3. `src/app/items/[id]/page.tsx` - Complete redesign

### Environment
- **Next.js 15** (App Router)
- **Prisma 5.22.0**
- **Fonts**: Playfair Display, Inter (already imported in globals.css)
- **Colors**: Available as CSS variables (--primary, --gold, etc.)

---

## Design Principles
1. **Minimalist Luxury**: Clean layouts, generous whitespace
2. **Touch-First**: 44px minimum touch targets
3. **Premium Details**: Smooth transitions, subtle shadows
4. **Information Hierarchy**: Right amount of data, well-organized
5. **Originality**: Surprise and delight, not generic

---

## Next Steps
Start with **Item Detail Page** (highest priority per user feedback "don't like it at all"), then **Search with Categories**, then **Inbox**.

Good luck! The foundation is solid - Moroccan design system, navigation, and landing page are all polished. 🚀
