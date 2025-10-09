Este es un prompt detallado y con contexto dirigido a un Desarrollador Frontend para que complete la parte de React/TypeScript de la prueba técnica, asumiendo que el Backend (NestJS + Base de Datos) ya está funcional y expuesto a través de la API REST.

El objetivo principal es que el desarrollador frontend refactorice el código existente (si lo hay) o implemente desde cero la interfaz según los requerimientos, asegurando la calidad del código, testing, y una experiencia de usuario óptima.

🚀 Technical Test – Frontend Task (React Typescript)
Contexto de la Prueba Técnica
El objetivo de esta prueba es construir un sistema Fullstack para visualizar el Balance Eléctrico Nacional de Red Eléctrica de España (REE).

Backend (Completado): Se ha desarrollado un servicio en NestJS/TypeScript que consulta periódicamente la API pública de REE, almacena los datos históricos en una base de datos SQL (contenida en Docker), y expone la información a través de una API REST.

Base de Datos: Contenerizada (por ejemplo, PostgreSQL/MySQL).

Tu Tarea (Frontend): Consumir la API REST del backend para mostrar los datos de Balance Eléctrico de forma clara, interactiva y visual en una SPA de React/TypeScript. Debes asegurar una arquitectura limpia, robustez en el manejo de errores y testing exhaustivo.

🎯 Objetivo Principal
Implementar o Refactorizar la Single Page Application (SPA) con React y TypeScript para consumir los datos de la API REST del backend y presentarlos según los requisitos.

🔌 API REST del Backend (Punto de Conexión)
Tu aplicación debe consumir la API REST provista por el servicio NestJS. El endpoint principal que necesitarás es:

Método Endpoint Descripción Parámetros
GET /api/balance/date-range Obtiene el balance eléctrico nacional en un rango de fechas. ?start_date=YYYY-MM-DDTHH:mm&end_date=YYYY-MM-DDTHH:mm

Exportar a Hojas de cálculo
Recomendación: La fecha y hora deben ser manejadas en formato ISO 8601 (YYYY-MM-DDTHH:mm).

Nota: Asume que el backend está corriendo en http://localhost:3000 (o el puerto configurado en el docker-compose.yml).

🖥️ Requisitos Frontend (React/TypeScript)

1. Arquitectura y Estructura
   Tecnología: React + TypeScript (con Vite, Next.js, o CRA a elección).

Gestión de Estado/Datos: Implementar la conexión y caché de datos usando React Query (o TanStack Query).

Estructura: Código modular con una clara separación de componentes (ej: Contenedores, Presentacionales, Hooks personalizados).

Tipado: Uso riguroso de TypeScript para definir las estructuras de datos de la API y los props de los componentes.

2. Funcionalidad (Visualización y UX)
   Filtro de Rango de Fechas: Implementar un selector de rango de fechas obligatorio (con hora) para que el usuario pueda consultar los datos históricos.

Debe haber una validación básica para asegurar que la fecha de inicio sea anterior a la fecha de fin.

Representación Gráfica:

Mostrar los datos principales (ej: Generación Total vs. Demanda Total) en un gráfico de líneas o barras (usando bibliotecas como Chart.js, Recharts, o Nivo).

La visualización debe ser interactiva (ej: tooltips al pasar el ratón).

Visualización Tabular/Detallada: Además del gráfico, mostrar una tabla o lista con los datos clave del balance (ej: Generación de Eólica, Demanda Nacional, Saldo de Intercambios Internacionales).

3. Robustez y Manejo de Errores
   Estados de Carga (Loading): Mostrar un skeleton o un spinner apropiado mientras se espera la respuesta del backend (gestión nativa de React Query).

Manejo de Errores (Error): Si la consulta falla (ej: error 400, 500, o network error), mostrar un mensaje de error claro y amigable al usuario, indicando la posibilidad de reintentar.

Estado Vacío (No Data): Si la API devuelve un resultado exitoso pero sin datos para el rango seleccionado, informar al usuario de manera clara.

✅ Testing Requerido
Debes incluir pruebas significativas en tu solución Frontend (utilizando Jest, React Testing Library, o Vitest):

Pruebas de Componentes: Asegurar que los componentes principales (filtros, tabla, gráfico) renderizan correctamente y responden a las interacciones del usuario.

Pruebas de Lógica de Datos/Hooks: Probar los custom hooks o la lógica de manejo de datos, especialmente la integración con React Query (ej: simular estados de éxito, carga y error).

🚀 Tareas de Refactorización / Implementación
Configuración Inicial: Asegúrate de que el proyecto está configurado con React, TypeScript y la biblioteca de gráficos elegida.

Capa de Datos: Implementa los custom hooks de React Query para conectar y tipar correctamente el consumo del endpoint /api/balance/date-range.

Componente de Filtro: Crea un componente robusto para la selección del rango de fechas.

Componente de Gráfico: Implementa la visualización gráfica de los datos de balance.

Manejo de Estados: Integra los estados de isLoading, isError, y data de React Query en la UI para ofrecer una experiencia de usuario fluida.

Pruebas: Escribe las pruebas unitarias y de integración para cubrir los requisitos.

Criterios de Evaluación
Se valorará especialmente:

Arquitectura: Diseño de componentes limpios, reutilizables y tipados.

Uso de React Query: Implementación correcta de useQuery, mutations, y opciones de caché.

Robustez: Manejo impecable de estados de carga, error y reintentos.

Testing: Cobertura de pruebas significativa para la capa de datos y la UI.

UX/Visualización: Claridad y calidad del gráfico y la información presentada.
