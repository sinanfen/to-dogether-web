# To-Dogether 💕

Modern, responsive ve PWA destekli çiftler için todo list uygulaması. Next.js, TypeScript, Tailwind CSS ve TanStack React Query ile geliştirilmiştir.

## ✨ Özellikler

- 🔐 **Authentication** - Kullanıcı girişi ve kayıt sistemi
- 👫 **Collaborative Lists** - Partner ile paylaşılabilir todo listeleri
- 📱 **PWA Support** - Progressive Web App desteği
- 🎨 **Modern UI** - Tailwind CSS ile responsive tasarım
- ⚡ **Real-time Updates** - TanStack React Query ile otomatik senkronizasyon
- 🎯 **Priority Levels** - Todo item'lar için öncelik seviyeleri
- 🔄 **Offline Support** - Service Worker ile offline çalışma desteği
- 🎨 **Custom Colors** - Kullanıcı başına özelleştirilebilir renkler

## 🛠️ Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **PWA**: next-pwa
- **HTTP Client**: Axios
- **Icons**: Heroicons (Custom SVG Components)

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── lists/             # Todo list pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
└── types/                 # TypeScript type definitions
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Repository'i klonlayın**
   ```bash
   git clone <repository-url>
   cd to-dogether-web
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment variables ayarlayın**
   ```bash
   # .env.local dosyası oluşturun
   NEXT_PUBLIC_API_BASE_URL=https://localhost:54696
   NEXT_PUBLIC_APP_NAME=To-Dogether
   ```

4. **Development server'ı başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**
   ```
   https://localhost:54696
   ```

## 📱 PWA Kurulumu

1. Uygulamayı modern bir tarayıcıda açın
2. Address bar'da "Install" butonuna tıklayın
3. Veya tarayıcı menüsünden "Add to Home Screen" seçin
4. Uygulama artık home screen'inizde!

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint
```

## 🗂️ API Entegrasyonu

Uygulama, aşağıdaki endpoint'leri kullanır:

### Authentication
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/refresh` - Token yenileme
- `POST /auth/logout` - Çıkış

### User Management
- `GET /users/me` - Mevcut kullanıcı bilgileri
- `PUT /users/profile` - Profil güncelleme

### Todo Lists
- `GET /todolists` - Kullanıcının listeleri
- `POST /todolists` - Yeni liste oluşturma
- `PUT /todolists/:id` - Liste güncelleme
- `DELETE /todolists/:id` - Liste silme
- `GET /todolists/partner` - Partner'ın listeleri

### Todo Items
- `GET /todolists/:id/items` - Liste item'ları
- `POST /todolists/:id/items` - Yeni item oluşturma
- `PUT /todolists/:listId/items/:itemId` - Item güncelleme
- `DELETE /todolists/:listId/items/:itemId` - Item silme

### Partner
- `GET /partner/overview` - Partner özet bilgileri

## 🎯 Ana Sayfalar

### 🏠 Landing Page (`/`)
- Modern ve çekici ana sayfa
- Feature showcase
- Call-to-action butonları

### 🔐 Authentication (`/auth/login`, `/auth/register`)
- Kullanıcı girişi ve kayıt sayfaları
- Form validasyonu
- Error handling

### 📊 Dashboard (`/dashboard`)
- Kullanıcının todo listeleri
- Partner'ın listeleri
- Quick actions sidebar
- Partner overview widget

### 📝 Todo List Detail (`/lists/[id]`)
- Todo item'ların listesi
- Yeni item ekleme
- Item status değiştirme
- Priority seviyeleri

## 🔨 Geliştirme Notları

### State Management
- **React Query** kullanılarak server state yönetimi
- **React Context** kullanılarak authentication state
- Otomatik cache invalidation
- Background refetching

### Error Handling
- API error'ları için unified error handling
- User-friendly error messages
- Retry mekanizması

### Performance
- Code splitting ile lazy loading
- Image optimization
- Service Worker ile caching
- Bundle analyzer ile optimization

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 📦 Deployment

### Vercel (Önerilen)

1. GitHub'a push edin
2. Vercel'e connect edin
3. Environment variables'ları ayarlayın
4. Deploy edin

### Manuel Deployment

```bash
# Build
npm run build

# Start production server
npm run start
```

## 🚀 Production Checklist

- [ ] API URL'leri production'a ayarlandı
- [ ] Environment variables konfigüre edildi
- [ ] PWA manifest dosyası doğru
- [ ] Service Worker çalışıyor
- [ ] Icons ve assets optimize edildi
- [ ] Error tracking kuruldu
- [ ] Analytics entegre edildi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun
3. Commit edin
4. Push edin
5. Pull Request oluşturun

## 📝 License

MIT License

## 💖 Credits

- **Design**: Modern ve minimalist tasarım
- **Icons**: Heroicons
- **Fonts**: Inter
- **Colors**: Tailwind CSS color palette

---

**To-Dogether** - Çiftler için modern todo list uygulaması 💕

*Made with ❤️ for couples who plan together*
