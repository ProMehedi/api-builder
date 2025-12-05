# API Builder

<div align="center">
  
  **Build REST APIs in Minutes — No Backend Code Required**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 🗃️ Collection Management

- **Create Collections** — Define your data structure with a visual schema builder
- **Multiple Field Types** — String, Number, Boolean, Email, URL, Date, DateTime, Text, Select, JSON, and Relations
- **Drag & Drop Fields** — Reorder fields with intuitive drag-and-drop
- **Field Validation** — Set required fields, default values, and descriptions

### 🔗 Relations

- **Single Relations** (Many-to-One) — Link items to a single related item
- **Multiple Relations** (Many-to-Many) — Link items to multiple related items
- **Configurable Population** — Control which fields to populate in API responses
- **Smart Display** — Choose display fields for better UX

### 🚀 Auto-Generated REST APIs

Every collection automatically gets full CRUD endpoints:

| Method   | Endpoint                 | Description     |
| -------- | ------------------------ | --------------- |
| `GET`    | `/api/{collection}`      | List all items  |
| `GET`    | `/api/{collection}/{id}` | Get single item |
| `POST`   | `/api/{collection}`      | Create new item |
| `PUT`    | `/api/{collection}/{id}` | Update item     |
| `DELETE` | `/api/{collection}/{id}` | Delete item     |

### 🔐 Route Settings

- **Enable/Disable Routes** — Toggle individual API endpoints
- **Custom Paths** — Rename API endpoints
- **API Key Protection** — Secure routes with API keys
- **Population Control** — Configure default relation population

### 👤 Multi-Tenant Workspaces

- **User Subdomains** — Each user gets their own workspace (e.g., `username.localhost:3000`)
- **Isolated Data** — Collections and items are scoped to workspaces
- **Custom Usernames** — Choose and change your workspace subdomain

### 🎨 Modern UI/UX

- **Directus/Strapi Inspired** — Clean, professional admin interface
- **Sidebar Navigation** — Quick access to all collections
- **Dark/Light Mode** — Toggle between themes
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Category             | Technology                   |
| -------------------- | ---------------------------- |
| **Framework**        | Next.js 15 (App Router)      |
| **Language**         | TypeScript 5                 |
| **Styling**          | Tailwind CSS 4               |
| **UI Components**    | shadcn/ui + Radix UI         |
| **State Management** | Zustand                      |
| **Data Fetching**    | React Query (TanStack Query) |
| **Authentication**   | Better Auth                  |
| **Database**         | SQLite (better-sqlite3)      |
| **Storage**          | File-based JSON storage      |
| **Drag & Drop**      | dnd-kit                      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/api-builder.git
   cd api-builder
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```env
   BETTER_AUTH_SECRET=your-super-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Run database migrations**

   ```bash
   bunx @better-auth/cli migrate
   ```

5. **Start the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
api-builder/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages (login, signup)
│   ├── api/                  # API routes
│   │   ├── [collection]/     # Dynamic collection endpoints
│   │   ├── auth/             # Better Auth handlers
│   │   └── sync/             # Client-server sync
│   ├── collections/          # Collection pages
│   │   └── [id]/             # Collection detail, edit, items
│   ├── settings/             # User settings
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard
├── components/               # React components
│   ├── ui/                   # shadcn/ui primitives
│   ├── app-sidebar.tsx       # Main navigation
│   ├── app-topbar.tsx        # Breadcrumbs & actions
│   ├── dashboard.tsx         # Home page content
│   ├── data-table.tsx        # Items table
│   ├── field-editor.tsx      # Schema field editor
│   └── ...
├── lib/                      # Utilities & stores
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── store.ts              # Zustand store
│   ├── storage.ts            # File-based storage
│   ├── types.ts              # TypeScript types
│   └── ...
├── data/                     # JSON data storage (gitignored)
└── public/                   # Static assets
```

---

## 🔧 Configuration

### Environment Variables

| Variable             | Description                | Required |
| -------------------- | -------------------------- | -------- |
| `BETTER_AUTH_SECRET` | Secret key for JWT signing | Yes      |
| `BETTER_AUTH_URL`    | Base URL of your app       | Yes      |

### Subdomain Setup (Development)

For local development with subdomains, your browser needs to resolve `*.localhost` domains. Most modern browsers handle this automatically.

**Testing subdomains:**

```
http://localhost:3000          # Main app
http://username.localhost:3000 # User workspace
```

---

## 📖 API Documentation

### List Items

```bash
GET /api/{collection}
```

**Query Parameters:**

- `populate` — Comma-separated relation fields to populate

**Example:**

```bash
curl http://localhost:3000/api/posts?populate=author,tags
```

### Get Single Item

```bash
GET /api/{collection}/{id}
```

**Query Parameters:**

- `populate` — Comma-separated relation fields to populate

### Create Item

```bash
POST /api/{collection}
Content-Type: application/json

{
  "fieldName": "value",
  "relationField": "related-item-id"
}
```

### Update Item

```bash
PUT /api/{collection}/{id}
Content-Type: application/json

{
  "fieldName": "updated value"
}
```

### Delete Item

```bash
DELETE /api/{collection}/{id}
```

### Protected Routes

For routes with API key protection:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/posts
```

---

## 🎯 Roadmap

- [ ] Webhooks support
- [ ] GraphQL API generation
- [ ] File/Media field type
- [ ] Role-based access control
- [ ] API rate limiting
- [ ] Export/Import collections
- [ ] Audit logs
- [ ] Real-time updates (WebSockets)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 API Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — The React Framework
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful UI components
- [Better Auth](https://better-auth.com/) — Authentication library
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Directus](https://directus.io/) & [Strapi](https://strapi.io/) — UI/UX inspiration

---

<div align="center">
  <p>Built with ❤️ by Mehedi Hasan</p>
  <p>
    <a href="https://github.com/promehedi/api-builder">GitHub</a> •
    <a href="https://promehedi.com">Website</a> •
    <a href="https://twitter.com/promehedi">Twitter</a>
  </p>
</div>
