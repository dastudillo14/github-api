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
- ✅ Documentación automática con Swagger
- ✅ Logging detallado de operaciones
- ✅ Métricas calculadas de usuarios (estrellas, ratios, actividad)
- ✅ Configuración mediante variables de entorno
- ✅ Dockerfile optimizado con multi-stage build
- ✅ Contenedor seguro con usuario no-root

## 📋 Endpoints Disponibles

### 1. Obtener Perfil de Usuario
```http
GET /github/profiles/{username}
```

**Descripción:** Obtiene la información del perfil de un usuario de GitHub.

**Respuesta:**
```json
{
  "username": "octocat",
  "fullName": "The Octocat",
  "avatar": "https://github.com/images/error/octocat_happy.gif",
  "bio": "A mysterious octocat that lives in San Francisco",
  "publicRepos": 8,
  "followers": 20,
  "profileUrl": "https://github.com/octocat"
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/github/profiles/octocat
```

### 2. Obtener Métricas de Usuario
```http
GET /github/metrics/{username}
```

**Descripción:** Obtiene métricas calculadas de un usuario de GitHub, incluyendo total de estrellas, ratio de seguidores/repositorios y días desde el último push.

**Respuesta:**
```json
{
  "username": "octocat",
  "metrics": {
    "totalStars": 150,
    "followersToReposRatio": 2.5,
    "lastPushDaysAgo": 5
  }
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/github/metrics/octocat
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

## 🐳 Docker

El proyecto incluye un Dockerfile optimizado con multi-stage build para producción.

### Construir la imagen

```bash
# Construir la imagen
docker build -t github-api .

# Construir con tag específico
docker build -t github-api:latest .
```

### Ejecutar el contenedor

```bash
# Ejecutar en modo desarrollo (con volumen para hot reload)
docker run -p 3000:3000 --env-file config.env github-api

# Ejecutar en modo producción
docker run -d -p 3000:3000 --env-file config.env --name github-api github-api

# Ejecutar con variables de entorno específicas
docker run -p 3000:3000 \
  -e GITHUB_API_URL=https://api.github.com \
  -e GITHUB_TOKEN=your_token_here \
  -e CACHE_TTL=300000 \
  -e PORT=3000 \
  github-api
```

### Características del Dockerfile

- **Multi-stage build**: Optimiza el tamaño de la imagen final
- **Node.js 18 Alpine**: Imagen base ligera y segura
- **Usuario no-root**: Ejecuta la aplicación con usuario `nestjs` para seguridad
- **Solo dependencias de producción**: Reduce el tamaño de la imagen
- **Puerto 3000**: Expuesto por defecto
- **Configuración de entorno**: Soporte para archivo `config.env`

### Docker Compose (Opcional)

Puedes crear un archivo `docker-compose.yml` para facilitar el despliegue:

```yaml
version: '3.8'
services:
  github-api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - config.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

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
- **Claves de cache utilizadas:**
  - `user:{username}` - Para perfiles de usuario
  - `metrics:{username}` - Para métricas calculadas
- Los logs muestran hits/misses del cache con duración de operaciones
- El cache se puede limpiar reiniciando la aplicación
- Las métricas se calculan una vez y se cachean para evitar múltiples llamadas a la API

## 🔧 Escalabilidad

### Para Escalar el Proyecto

1. **Cache Distribuido**: Reemplazar cache en memoria por Redis
2. **Rate Limiting**: Implementar límites de velocidad
3. **Load Balancing**: Usar múltiples instancias
4. **Monitoring**: Agregar métricas y logging
5. **Database**: Persistir datos frecuentemente consultados

## 📝 Logs

El sistema incluye logging detallado para:
- **Cache hits/misses** con duración de operaciones
- **Errores de API** con stack traces
- **Operaciones de dominio** (getUser, getUserMetrics)
- **Paginación de repositorios** con conteo de elementos por página
- **Cálculo de métricas** con estadísticas detalladas
- **Decorador @LogExecution** para tracking de métodos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
