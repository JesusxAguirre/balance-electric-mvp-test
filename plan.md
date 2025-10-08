🗺️ Plan de Desarrollo Frontend: Balance Eléctrico
Rol: Senior Tech Lead
Proyecto: Interfaz de Consumo de Datos del Balance Eléctrico (REE)
Tecnología: React, TypeScript, Tailwind CSS (para estética), React Query
🎯 Objetivo de la Fase Frontend
Construir una Single Page Application (SPA) en React/TypeScript que consuma la API REST del backend para visualizar de manera clara e interactiva los datos históricos y actuales del balance eléctrico, priorizando la experiencia de usuario (UX) y el manejo robusto de estados (carga, error, éxito).
🛠️ Stack Tecnológico (Decisiones Clave)
Área
Herramienta
Justificación
Framework
React + TypeScript
Cumple el requisito. TypeScript garantiza tipado estricto y reduce errores.
Data Fetching/Estado
React Query (TanStack Query)
Permite gestionar de forma declarativa el estado del servidor, incluyendo caching, re-fetching, retries y estados de isLoading/isError de forma nativa y robusta.
Visualización
Recharts o Chart.js
Se prioriza Recharts por su naturaleza declarativa y facilidad de integración con React/TypeScript para gráficos de series de tiempo.
Estilización
Tailwind CSS
Acelera el desarrollo y garantiza un diseño responsive y moderno sin necesidad de archivos CSS separados (Single File Mandate).
Testing
Jest + React Testing Library (RTL)
Estándares de la industria para pruebas unitarias y de integración de componentes, enfocándose en el comportamiento del usuario.

🗓️ Fases de Implementación (Enfoque Iterativo)
Dividimos el desarrollo del Frontend en tres fases principales:
Fase 1: Configuración e Integración Base
Tarea
Objetivo
Criterio de Éxito
1.1. Setup del Proyecto
Inicializar el proyecto React/TS e integrar ESLint, Prettier y Tailwind CSS.
Entorno de desarrollo funcional y reglas de estilo aplicadas.
1.2. Configuración de React Query
Instalar react-query y configurar el QueryClientProvider en el componente raíz (App).
El dev-tools de React Query se renderiza correctamente.
1.3. Conexión Backend (Hook)
Crear el custom hook principal (useBalanceData) para la petición a la API REST del backend (/balance).
El hook puede obtener datos mockeados o reales (si el backend está levantado) y reportar correctamente los estados isLoading y isSuccess.
1.4. Diseño de Tipos (Schemas)
Definir los tipos de TypeScript (interface) para la respuesta de la API del backend, garantizando la compatibilidad.
Tipos definidos en src/types/balance.d.ts.

Fase 2: Desarrollo de la Interfaz y Visualización (Core)
Módulo/Componente
Descripción
Requisito que Cumple
2.1. Componente DateRangePicker
Componente de entrada para seleccionar las fechas de inicio y fin, que debe validar el formato y el rango (startDate <= endDate).
Obtener datos por rango de fechas.
2.2. Componente BalanceChart
Componente principal que utiliza la librería de gráficos seleccionada (Recharts). Debe ser capaz de mapear los datos crudos del backend a un formato visualizable (series de tiempo, barras, etc.).
Representación gráfica.
2.3. Componente Dashboard
Componente padre de la SPA que orquesta el DateRangePicker y el BalanceChart, manejando el estado de la consulta.
SPA, Conexión al backend.
2.4. Mapeo de Datos para Gráfico
Implementar la lógica de negocio para transformar los datos de la API (que pueden ser complejos) al formato simple que el componente de gráfico requiere.
Interfaz clara y funcional.

Fase 3: Calidad, Robustez y Testing
Tarea
Enfoque de Calidad
Criterio de Éxito
3.1. Manejo de Estado Loading
Implementar skeletons o un indicador de carga visible en el Dashboard mientras useBalanceData está en isLoading.
Cero Cumulative Layout Shift (CLS); transición suave al cargar.
3.2. Manejo de Estado Error
Implementar una interfaz amigable para errores de la API (ej: 500 o 404), mostrando un mensaje y una opción de retry (gracias a React Query).
El usuario es informado claramente si la API falla.
3.3. Pruebas Unitarias (RTL)
Escribir pruebas para el DateRangePicker y el mapeo de datos, verificando que los tipos de datos se manejen correctamente.
Cobertura de tests para la lógica central (mínimo 70%).
3.4. Pruebas de Integración (RTL)
Probar el Dashboard y BalanceChart mockeando el hook useBalanceData para simular los estados isLoading, isError y isSuccess.
Confirmar que los componentes reaccionan visualmente a todos los estados del servidor.

🧩 Estructura Modular de Componentes
Para garantizar la Arquitectura limpia y modular solicitada:
src/
├── api/
│ └── hooks/
│ └── useBalanceData.ts # Hook principal con React Query
├── components/
│ ├── layout/
│ │ └── Header.tsx
│ ├── ui/
│ │ └── LoadingSpinner.tsx
│ ├── features/
│ │ ├── DateRangePicker.tsx # Control de selección de fechas
│ │ └── BalanceChart.tsx # Componente de visualización (Recharts)
├── pages/
│ └── Dashboard.tsx # Componente principal SPA
├── tests/ # Ubicación de los archivos .spec.ts / .test.tsx
└── types/
└── balance.d.ts # Definiciones de interfaces TypeScript

✅ Criterios de Éxito del Frontend
Conectividad: La aplicación se inicia y puede obtener datos del backend usando useBalanceData.
Respuesta al Estado: La interfaz maneja y muestra correctamente los tres estados: Loading, Success (datos en gráfico), y Error (mensaje amigable al usuario).
Visualización: El BalanceChart representa al menos dos series de datos clave (ej: Generación vs. Demanda) y es funcionalmente interactivo (ej: tooltips).
Calidad del Código: Los componentes son funcionales, reutilizables, y el testing cubre los componentes críticos.
Responsiveness: El diseño se adapta correctamente a dispositivos móviles y de escritorio (gracias a Tailwind CSS).
