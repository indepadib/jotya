# Jotya - Moroccan Premium Second-Hand Marketplace

**Marketplace de luxe pour articles de seconde main authentifiés au Maroc**

## 🌟 Features

- ✅ **Authentication** - Inscription, connexion, vérification email
- ✅ **Listings** - Upload avec compression d'images (Base64), AI analysis
- ✅ **Search** - Catégories hiérarchiques, filtres avancés, AI smart search
- ✅ **Messaging** - Chat en temps réel, système d'offres
- ✅ **Payments** - Stripe (cartes) + Cash on Delivery (COD)
- ✅ **Shipping** - Support pour Amana, Digylog, Tawssil
- ✅ **Analytics** - Dashboards vendeur et admin
- ✅ **AI** - Assistant intelligent, analyse d'images, vérification d'authenticité

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Stripe account
- OpenAI API key (pour features AI)

### Installation

```bash
# Clone le repository
git clone https://github.com/indepadib/jotya.git
cd jotya

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# Setup la base de données
npx prisma generate
npx prisma db push

# (Optionnel) Seeder la base de données
npm run seed

# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Créer un fichier `.env` à la racine avec:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth / Session
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Payment
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (AI Features)
OPENAI_API_KEY="sk-..."

# Email (Resend)
RESEND_API_KEY="re_..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Shipping Carriers
DIGYLOG_API_KEY="..."
TAWSSIL_API_KEY="..."
```

## 📁 Project Structure

```
jotya/
├── src/
│   ├── app/                 # Next.js 16 App Router
│   │   ├── (auth)/         # Auth pages (login, signup)
│   │   ├── items/          # Item pages
│   │   ├── search/         # Search & filters
│   │   ├── inbox/          # Messaging
│   │   ├── profile/        # User profile
│   │   ├── admin/          # Admin panel
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/                # Utilities & helpers
│   └── styles/             # Global CSS
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seeds/              # Seed data
└── public/                 # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: CSS Modules
- **Payments**: Stripe
- **Email**: Resend
- **AI**: OpenAI GPT-4
- **Images**: Base64 (compressed to 100KB)
- **Deployment**: Netlify

## 📦 Key Dependencies

- `next` - React framework
- `prisma` - Database ORM
- `stripe` - Payment processing
- `openai` - AI features
- `resend` - Email notifications
- `browser-image-compression` - Image optimization
- `qrcode` - Shipping labels
- `framer-motion` - Animations

## 🎨 Design System

**Moroccan-Inspired Luxury Aesthetic**

- **Colors**: Terracotta (#C4785A), Gold (#D4A574), Deep Blue
- **Typography**: Playfair Display (headings) + Inter (body)
- **Theme**: Warm, premium, trustworthy

## 🚢 Deployment

### Netlify (Recommended)

```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables
# Add all .env variables in Netlify dashboard
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Apply to production
npx prisma migrate deploy
```

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run seed         # Seed database
npm run lint         # Run linter
```

## 🔐 Security

- Passwords hashed with bcrypt
- Session-based authentication
- CSRF protection
- SQL injection prevention (Prisma)
- XSS protection (React)

## 📊 Database Schema

Voir `prisma/schema.prisma` pour le schéma complet.

**Modèles principaux**:
- User
- Listing
- Transaction
- Message
- Review
- Wallet
- etc.

## 🤝 Contributing

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Private - Tous droits réservés

## 🆘 Support

Pour questions ou support:
- Email: support@jotya.ma
- GitHub Issues: [Issues](https://github.com/indepadib/jotya/issues)

---

**Made with ❤️ in Morocco** 🇲🇦
