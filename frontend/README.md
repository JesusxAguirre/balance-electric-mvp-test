# ⚡ Balance Eléctrico - Frontend

Dashboard web de visualización interactiva del balance eléctrico nacional de España (datos de REE - Red Eléctrica de España).

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración y Ejecución](#-configuración-y-ejecución)
- [Arquitectura y Flujo de Datos](#-arquitectura-y-flujo-de-datos)
- [Componentes Principales](#-componentes-principales)
- [Hooks Personalizados](#-hooks-personalizados)
- [Testing](#-testing)
- [Desarrollo](#-desarrollo)

---

## 🎯 Descripción General

Este frontend proporciona una interfaz moderna y reactiva para visualizar el balance eléctrico español. Permite a los usuarios:

- 📊 **Visualizar datos históricos** de generación, demanda y almacenamiento eléctrico
- 📅 **Consultas personalizadas** por rango de fechas
- 📈 **Múltiples vistas**: gráficos combinados mensuales, series temporales de 5 años, y treemaps jerárquicos por subtipos de energía
- 🔄 **Actualización de datos** desde la API de REE en tiempo real
- 📱 **Diseño responsive** optimizado para desktop y mobile

### Stack Tecnológico

- **React 19** - Framework de UI con hooks modernos
- **TypeScript** - Type safety y desarrollo robusto
- **Vite** - Build tool ultra-rápido con HMR
- **TanStack Query (React Query)** - Gestión avanzada de estado del servidor, caché y sincronización
- **Recharts** - Librería de gráficos declarativa y altamente personalizable
- **Tailwind CSS 4** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI accesibles y estilizados
- **Lucide React** - Iconos modernos y ligeros

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/                    # Capa de comunicación con el backend
│   │   └── hooks/
│   │       └── useBalanceData.tsx   # Custom hooks de React Query
│   │
│   ├── components/             # Componentes React
│   │   ├── charts/            # Visualizaciones de datos
│   │   │   ├── CombinedMonthlyChart.tsx   # Gráfico barras + línea mensual
│   │   │   ├── StackedAreaChart.tsx       # Área apilada (5 años)
│   │   │   └── EnergyTreemap.tsx          # Treemap jerárquico
│   │   │
│   │   ├── features/          # Funcionalidades específicas
│   │   │   ├── BalanceChart.tsx           # Gráfico principal de balance
│   │   │   ├── DateRangePicker.tsx        # Selector de rango de fechas
│   │   │   └── RefreshDataPanel.tsx       # Panel de administración de datos
│   │   │
│   │   └── ui/                # Componentes UI base (Shadcn)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── skeleton.tsx
│   │       └── ...
│   │
│   ├── types/                 # Definiciones TypeScript
│   │   └── energy.enums.ts   # Enums y tipos del dominio
│   │
│   ├── utils/                 # Utilidades y helpers
│   │
│   ├── tests/                 # Tests unitarios e integración
│   │   ├── DateRangePicker.test.tsx
│   │   ├── Dashboard.states.test.tsx
│   │   └── BalanceChart.mapping.test.tsx
│   │
│   ├── BalanceDashboard.tsx  # Componente principal del dashboard
│   ├── App.tsx               # Componente raíz
│   └── main.tsx              # Entry point de la aplicación
│
├── public/                    # Assets estáticos
├── vite.config.ts            # Configuración de Vite
├── tsconfig.json             # Configuración TypeScript
├── tailwind.config.js        # Configuración Tailwind CSS
└── package.json              # Dependencias y scripts
```

---

## ⚙️ Configuración y Ejecución

### Requisitos Previos

- **Node.js** >= 18.0.0
- **pnpm** (recomendado) o **npm** o **yarn**
- **Backend y Base de Datos** corriendo (via Docker Compose recomendado)

### Instalación

```bash
# Navegar al directorio del frontend
cd frontend/

# Instalar dependencias (recomendado: pnpm)
pnpm install

# Alternativas:
# npm install
# yarn install
```

### Configuración de Entorno

El frontend se conecta por defecto al backend en `http://localhost:3000`. Esta configuración está hardcodeada en `src/api/hooks/useBalanceData.tsx`:

```typescript
const API_BASE_URL = "http://localhost:3000/api/v1";
```

**Para producción o entornos personalizados**, puedes modificar esta constante o convertirla en una variable de entorno creando un archivo `.env.local`:

```env
# .env.local (opcional)
VITE_API_URL=http://localhost:3000/api/v1
```

Y actualizar el código para leer:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
```

### Ejecución en Desarrollo

```bash
# Modo desarrollo con HMR
pnpm dev

# La aplicación estará disponible en:
# http://localhost:5173
```

### Build para Producción

```bash
# Compilar TypeScript y construir assets optimizados
pnpm build

# Preview del build de producción
pnpm preview
```

### Ejecución con Docker (Recomendado)

Si ejecutas el proyecto completo via Docker Compose desde la raíz del repositorio:

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

El frontend estará disponible en `http://localhost:5173` y se conectará automáticamente al backend en `http://localhost:3000`.

---

## 🏗️ Arquitectura y Flujo de Datos

### Pipeline de Datos

El flujo de datos en el frontend sigue este patrón:

```
┌─────────────────┐
│  Usuario        │
│  (Interacción)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Componente React           │
│  (BalanceDashboard,         │
│   DateRangePicker, etc.)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Custom Hook                │
│  (useBalanceData,           │
│   useCurrentYearByMonth)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  React Query                │
│  - Cache management         │
│  - Request deduplication    │
│  - Optimistic updates       │
│  - Background refetch       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Fetch API                  │
│  (HTTP Request al Backend)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend NestJS             │
│  (/api/v1/balance)          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Transformación de Datos    │
│  (Backend → Frontend types) │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Componentes de             │
│  Visualización              │
│  (BalanceChart, Recharts)   │
└─────────────────────────────┘
```

### Gestión de Estados con React Query

React Query maneja automáticamente los siguientes estados:

1. **`isLoading`** - Primera carga de datos
2. **`isError`** - Errores de red o del servidor
3. **`isSuccess`** - Datos cargados exitosamente
4. **`isFetching`** - Re-fetching en background

**Ejemplo de uso en componente:**

```typescript
const { data, isLoading, isError, error, refetch } = useBalanceData(
  startDate,
  endDate
);

if (isLoading) return <Skeleton />;
if (isError) return <Alert>{error.message}</Alert>;
if (data && data.length === 0) return <EmptyState />;
return <BalanceChart data={data} />;
```

### Caché y Re-validación

React Query cachea los datos con estas estrategias:

- **`staleTime: 5 minutes`** - Los datos se consideran "frescos" durante 5 minutos
- **`retry: 1`** - Reintenta 1 vez en caso de fallo
- **Query invalidation** - El panel de administración puede invalidar manualmente la caché

---

## 🧩 Componentes Principales

### `BalanceDashboard.tsx`

Componente principal que orquesta toda la aplicación:

- Gestiona estado de rangos de fechas personalizados
- Renderiza múltiples visualizaciones simultáneas
- Coordina entre diferentes hooks de datos
- Maneja estados globales (loading, error, empty)

### `DateRangePicker.tsx`

Selector de rango de fechas con validación:

- Inputs nativos de tipo `datetime-local`
- Validación client-side (fecha inicio < fecha fin)
- Feedback visual de errores
- Callback `onDateChange` para comunicación con padre

### `RefreshDataPanel.tsx`

Panel administrativo para actualizar datos desde REE:

- Selección de tipo de energía y año
- Botón de refresh con estados (idle, loading, success, error)
- Integración con endpoint `/balance/refresh` del backend
- Callback `onRefreshComplete` para invalidar cache

### Componentes de Gráficos

#### `BalanceChart.tsx`

Gráfico de línea temporal con toggle entre generación/demanda.

#### `CombinedMonthlyChart.tsx`

Gráfico combinado de barras (generación) + línea (demanda) agrupado por mes.

#### `StackedAreaChart.tsx`

Área apilada mostrando evolución de 5 años de datos mensuales.

#### `EnergyTreemap.tsx`

Treemap jerárquico (tipo → subtipo) para análisis de composición energética.

---

## 🪝 Hooks Personalizados

### `useBalanceData(startDate, endDate, options?)`

Hook principal para consultas de balance eléctrico.

**Parámetros:**

```typescript
startDate: string;  // Formato: YYYY-MM-DD
endDate: string;    // Formato: YYYY-MM-DD
options?: {
  type?: EnergyType;                    // GENERATION | DEMAND | STORAGE
  subtype?: EnergySubtype;              // Ej: SOLAR, WIND, etc.
  time_grouping?: 'hour' | 'day' | 'month' | 'year';
}
```

**Retorno:**

```typescript
{
  data: BalanceRecord[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Ejemplo:**

```typescript
const { data, isLoading, isError } = useBalanceData(
  "2024-01-01",
  "2024-12-31",
  { time_grouping: "month" }
);
```

### Hooks Helper

- **`useCurrentYearByMonth()`** - Datos del año actual agrupados por mes
- **`useLastFiveYearsByMonth()`** - Últimos 5 años agrupados por mes
- **`useCategorizedBalanceData()`** - Datos categorizados por tipo de energía
- **`useCurrentYearCategorizedByMonth()`** - Año actual categorizado por mes

---

## 🧪 Testing

### Stack de Testing

- **Vitest** - Test runner (configurado en `vite.config.ts`)
- **React Testing Library** - Testing de componentes centrado en el usuario
- **@testing-library/jest-dom** - Matchers adicionales para el DOM

### Ejecutar Tests

```bash
# Ejecutar todos los tests
pnpm test

# Modo watch (desarrollo)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Estructura de Tests

Los tests están organizados en `/src/tests/`:

#### 1. **Tests de Componentes Interactivos** (`DateRangePicker.test.tsx`)

```typescript
describe("DateRangePicker", () => {
  it("shows error when applying without both dates", () => {
    const onDateChange = vi.fn();
    render(<DateRangePicker onDateChange={onDateChange} />);
    const apply = screen.getByRole("button", { name: /aplicar rango/i });
    fireEvent.click(apply);
    expect(
      screen.getByText(/Debes seleccionar ambas fechas/i)
    ).toBeInTheDocument();
  });
});
```

**Casos cubiertos:**

- ✅ Validación de campos vacíos
- ✅ Validación de fecha inicio > fecha fin
- ✅ Callback correcto con datos válidos

#### 2. **Tests de Estados del Dashboard** (`Dashboard.states.test.tsx`)

Mock de hooks de React Query para testear diferentes estados:

```typescript
vi.mock("../api/hooks/useBalanceData", () => ({
  useBalanceData: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));
```

**Casos cubiertos:**

- ✅ Renderizado inicial
- ✅ Estado de loading (skeletons)
- ✅ Estado de error (alerts)
- ✅ Estado vacío (sin datos)
- ✅ Estado success (con datos)

#### 3. **Tests de Transformación de Datos** (`BalanceChart.mapping.test.tsx`)

Tests unitarios para lógica de mapeo de datos del backend a formato del frontend.

### Estrategia de Testing

#### Qué se testea:

✅ **Lógica de validación** (fechas, inputs)  
✅ **Renderizado condicional** (loading, error, empty states)  
✅ **Interacciones de usuario** (clicks, inputs)  
✅ **Callbacks y eventos**  
✅ **Transformaciones de datos**

#### Qué NO se testea (por ahora):

❌ **Integración real con API** (se mockea React Query)  
❌ **Tests E2E** (se recomienda agregar Playwright/Cypress)  
❌ **Renderizado de gráficos Recharts** (complejo y no aporta valor)

### Cobertura de Código

**Meta:** >= 70% de cobertura en custom hooks y componentes de lógica.

```bash
# Generar reporte de cobertura
pnpm test:coverage

# Ver reporte HTML
open coverage/index.html
```

---

## 🛠️ Desarrollo

### Scripts Disponibles

```json
{
  "dev": "vite", // Servidor de desarrollo
  "build": "tsc && vite build", // Build de producción
  "lint": "eslint .", // Linter
  "preview": "vite preview", // Preview del build
  "test": "vitest run", // Ejecutar tests
  "test:watch": "vitest", // Tests en modo watch
  "test:coverage": "vitest run --coverage" // Coverage report
}
```

### Convenciones de Código

- **TypeScript strict mode** habilitado
- **ESLint** configurado para React + TypeScript
- **Prettier** (opcional, agregar `.prettierrc` si se desea)
- **Imports path alias:** `@/` apunta a `/src`

### Agregar Nuevos Componentes

```bash
# Componente UI (Shadcn)
npx shadcn-ui@latest add <component-name>

# Componente custom
touch src/components/features/MyComponent.tsx
```

### Agregar Nuevos Hooks

Los hooks personalizados deben ir en `/src/api/hooks/` y seguir el patrón:

```typescript
export const useMyCustomData = (params) => {
  return useQuery({
    queryKey: ["my-data", params],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/endpoint`);
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    },
  });
};
```

---

## 📚 Recursos Adicionales

- [React Query Documentation](https://tanstack.com/query/latest)
- [Recharts Documentation](https://recharts.org/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Backend README](../backend/README.md)

## 📄 Licencia

Ver archivo [LICENSE](../LICENSE) en la raíz del proyecto.
