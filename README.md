# GitHub API - NestJS con Arquitectura Hexagonal

Este proyecto implementa una API REST usando NestJS con arquitectura hexagonal para consumir la API de GitHub, incluyendo un sistema de cache de 5 minutos.

## 🏗️ Arquitectura Hexagonal

El proyecto sigue los principios de la arquitectura hexagonal (Ports and Adapters):

### Estructura del Proyecto

```
src/
├── github/
│   ├── domain/                    # Capa de Dominio
│   │   ├── entities/              # Entidades del dominio
│   │   │   ├── github-user.entity.ts
│   │   │   └── github-repository.entity.ts
│   │   ├── ports/                 # Interfaces (Puertos)
│   │   │   ├── github.port.ts
│   │   │   └── cache.port.ts
│   │   └── services/              # Servicios de dominio
│   │       └── github.service.ts
│   ├── infrastructure/            # Capa de Infraestructura
│   │   └── adapters/              # Adaptadores (Implementaciones)
│   │       ├── github.adapter.ts
│   │       └── cache.adapter.ts
│   ├── application/               # Capa de Aplicación
│   │   └── controllers/           # Controladores REST
│   │       └── github.controller.ts
│   └── github.module.ts           # Módulo principal
├── app.module.ts                  # Módulo raíz
└── main.ts                        # Punto de entrada
```

### Capas de la Arquitectura

1. **Dominio (Domain)**: Contiene la lógica de negocio pura
   - Entidades: `GitHubUser`, `GitHubRepository`
   - Puertos: Interfaces que definen contratos
   - Servicios: Lógica de negocio

2. **Infraestructura (Infrastructure)**: Implementaciones concretas
   - Adaptadores: Implementaciones de los puertos
   - GitHub Adapter: Consume la API de GitHub
   - Cache Adapter: Maneja el cache en memoria

3. **Aplicación (Application)**: Orquesta el flujo de datos
   - Controladores: Manejan las peticiones HTTP
   - Coordina entre dominio e infraestructura

## 🚀 Características

- ✅ Arquitectura Hexagonal (Ports and Adapters)
- ✅ Cache en memoria con TTL de 5 minutos
- ✅ Consumo de la API de GitHub
- ✅ Manejo de errores robusto
- ✅ Validación de parámetros
- ✅ Paginación en endpoints
- ✅ Configuración mediante variables de entorno

## 📋 Endpoints Disponibles

### 1. Obtener Usuario
```http
GET /github/users/{username}
```

**Ejemplo:**
```bash
curl http://localhost:3000/github/users/octocat
```

### 2. Obtener Repositorios de Usuario
```http
GET /github/users/{username}/repositories?page=1&per_page=10
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `per_page` (opcional): Elementos por página (default: 10, max: 100)

**Ejemplo:**
```bash
curl "http://localhost:3000/github/users/octocat/repositories?page=1&per_page=5"
```

### 3. Obtener Repositorio Específico
```http
GET /github/repositories/{owner}/{repo}
```

**Ejemplo:**
```bash
curl http://localhost:3000/github/repositories/octocat/Hello-World
```

### 4. Buscar Repositorios
```http
GET /github/search/repositories?q={query}&page=1&per_page=10
```

**Parámetros de consulta:**
- `q` (requerido): Término de búsqueda
- `page` (opcional): Número de página (default: 1)
- `per_page` (opcional): Elementos por página (default: 10, max: 100)

**Ejemplo:**
```bash
curl "http://localhost:3000/github/search/repositories?q=nestjs&page=1&per_page=5"
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `config.env` con las siguientes variables:

```env
# GitHub API Configuration
GITHUB_API_URL=https://api.github.com
GITHUB_TOKEN=your_github_token_here

# Cache Configuration
CACHE_TTL=300000
CACHE_MAX=100

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Token de GitHub (Opcional)

Para obtener un token de GitHub:
1. Ve a GitHub Settings > Developer settings > Personal access tokens
2. Genera un nuevo token con permisos de lectura
3. Agrega el token al archivo `config.env`

**Nota:** Sin token, la API funcionará pero con límites más restrictivos.

## 🛠️ Instalación y Ejecución

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp config.env.example config.env
# Editar config.env con tus valores
```

### Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📊 Cache

El sistema de cache está configurado con:
- **TTL**: 5 minutos (300,000 ms)
- **Máximo de elementos**: 100
- **Estrategia**: Cache en memoria

### Comportamiento del Cache

- Las respuestas se cachean automáticamente por 5 minutos
- Las claves de cache incluyen parámetros de paginación
- Los logs muestran hits/misses del cache
- El cache se puede limpiar reiniciando la aplicación

## 🔧 Escalabilidad

### Para Escalar el Proyecto

1. **Cache Distribuido**: Reemplazar cache en memoria por Redis
2. **Rate Limiting**: Implementar límites de velocidad
3. **Load Balancing**: Usar múltiples instancias
4. **Monitoring**: Agregar métricas y logging
5. **Database**: Persistir datos frecuentemente consultados

### Ejemplo de Cache con Redis

```typescript
// En cache.adapter.ts
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheAdapter implements CachePort {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.setex(key, ttl || 300, JSON.stringify(value));
  }
}
```

## 📝 Logs

El sistema incluye logging para:
- Cache hits/misses
- Errores de API
- Operaciones de cache

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
