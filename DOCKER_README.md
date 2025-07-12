# Docker ile To-Dogether Web Uygulaması

Bu proje Docker kullanılarak containerize edilmiştir.

## Gereksinimler

- Docker
- Docker Compose

## Kullanım

### Geliştirme Ortamı

```bash
# Uygulamayı build et ve çalıştır
docker-compose up --build

# Arka planda çalıştır
docker-compose up -d --build
```

### Production Ortamı

```bash
# Production build
docker-compose -f docker-compose.yml up --build -d
```

## Erişim

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Docker Komutları

```bash
# Container'ları durdur
docker-compose down

# Container'ları ve image'ları temizle
docker-compose down --rmi all

# Logları görüntüle
docker-compose logs -f

# Container'a bağlan
docker-compose exec app sh
```

## Environment Variables

Gerekirse `.env` dosyası oluşturup environment variable'ları tanımlayabilirsiniz:

```env
NODE_ENV=production
PORT=3000
```

## Health Check

Uygulama `/api/health` endpoint'i ile health check yapar. Bu endpoint'i projenizde oluşturmanız gerekebilir.

## Notlar

- Multi-stage build kullanılarak image boyutu optimize edilmiştir
- Non-root user ile güvenlik sağlanmıştır
- Alpine Linux base image kullanılarak boyut minimize edilmiştir
- Next.js standalone output kullanılmıştır 