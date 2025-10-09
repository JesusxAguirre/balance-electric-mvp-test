# balance-electric-mvp-test
Prueba técnica de primer impacto con React y NestJS
---
## 📸 **Screenshots**

<img width="1859" height="851" alt="image" src="https://github.com/user-attachments/assets/e2d15a42-7952-4190-8a10-5328e3533c80" />

<img width="1893" height="924" alt="Captura de pantalla_20251009_153310" src="https://github.com/user-attachments/assets/879db2ce-164c-451e-8cfe-f10d4b049010" />

<img width="1858" height="843" alt="image" src="https://github.com/user-attachments/assets/8911b1d7-e363-490a-a66f-3d6d0c33d4de" />

<img width="942" height="676" alt="image" src="https://github.com/user-attachments/assets/8d1b51d0-4c9c-4ba1-b4f6-5a522e72afbf" />


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

   ```

2. **Iniciar la aplicación con Docker Compose**
   ```bash
   docker-compose up --build
   ```

   Esto iniciará automáticamente:
   - ✅ Base de datos PostgreSQL
   - ✅ Migraciones de base de datos (ejecutadas automáticamente)
   - ✅ Backend (NestJS) en `http://localhost:3000`
   - ✅ Frontend (React) en `http://localhost:5173`

   **Nota:** Las migraciones de base de datos se ejecutan automáticamente al iniciar el backend. No es necesario ejecutarlas manualmente.

3. **Acceder a la aplicación**
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
