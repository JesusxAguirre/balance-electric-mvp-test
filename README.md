# balance-electric-mvp-test
Prueba técnica de primer impacto con React y NestJS

## 🚀 Inicio Rápido

### Prerequisitos
- Docker y Docker Compose instalados
- pnpm (si vas a desarrollar localmente sin Docker)

### Instalación y Ejecución

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd balance-electric-mvp-test
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.template .env
   # Editar .env con tus valores si es necesario
   ```

3. **Iniciar la aplicación con Docker Compose**
   ```bash
   docker-compose up --build
   ```

   Esto iniciará automáticamente:
   - ✅ Base de datos PostgreSQL
   - ✅ Migraciones de base de datos (ejecutadas automáticamente)
   - ✅ Backend (NestJS) en `http://localhost:3000`
   - ✅ Frontend (React) en `http://localhost:5173`

   **Nota:** Las migraciones de base de datos se ejecutan automáticamente al iniciar el backend. No es necesario ejecutarlas manualmente.

4. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Estructura del Proyecto

```
├── backend/          # API NestJS
├── frontend/         # Aplicación React
├── docker-compose.yml
└── .env.template
```

## 🛠️ Desarrollo

Para más detalles sobre el desarrollo individual de cada módulo, consulta:
- [Backend README](./backend/README.md) - API NestJS, migraciones, testing
- [Frontend README](./frontend/README.md) - React Dashboard, arquitectura, componentes, hooks y testing

## 🧪 Testing

Cada módulo tiene su propia suite de testing:

### Backend
```bash
cd backend/
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
```

### Frontend
```bash
cd frontend/
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

Consulta la documentación específica de cada módulo para más detalles.
