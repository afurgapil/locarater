# Proje Yapisi

apps/
├── web/ # Frontend (Next.js)
│ ├── src/
│ │ ├── app/ # Pages
│ │ ├── components/ # UI Components
│ │ ├── hooks/ # Custom Hooks
│ │ ├── services/ # API Services
│ │ ├── store/ # State Management
│ │ ├── types/ # TypeScript Types
│ │ └── utils/ # Helper Functions
│
└── api/ # Backend (Express)
├── src/
│ ├── controllers/ # Route Controllers
│ ├── models/ # Database Models
│ ├── routes/ # API Routes
│ ├── services/ # Business Logic
│ └── utils/ # Helper Functions

## Web

### APP

- Header ve Footer elemani olmali. Footer klasik olabilir, header icerisinde logo, navigation ve user bilgileri yer almali.
- Auth modulu: - login ve register sayfalari olmali. private routelar kontrol edilmeli.
- Dashboard: login olmus kullanicilarin kendi profillerini goruntuledigi sayfa olmali.
- Location: location elemanlari listelenmeli, reviewler alt kisimda goruntulenmeli.
