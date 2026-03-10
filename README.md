# Componentes Reutilizables - LWC Salesforce

Colección de Lightning Web Components (LWC) listos para deployarse en cualquier org de Salesforce. Cada componente es un proyecto SFDX independiente y autocontenido.

## Estructura del repositorio

```
Componentes-Reutilizables/
├── README.md
├── package.json            # Dependencias compartidas (ESLint, Prettier, Jest)
├── eslint.config.js        # Configuración de linting compartida
├── jest.config.js          # Configuración de tests compartida
├── .prettierrc             # Formateo de código compartido
├── .husky/                 # Git hooks compartidos
│
├── calendario-personalizado/   # → Proyecto SFDX independiente
├── listas-relacionadas/        # → Proyecto SFDX independiente
└── .../                        # → Más componentes...
```

Cada subcarpeta es un proyecto SFDX completo con su propio `sfdx-project.json` y `force-app/`.

## Componentes disponibles

| Componente | Descripción | API Version |
|---|---|---|
| *(próximamente)* | | |

## Cómo usar un componente

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/Componentes-Reutilizables.git
cd Componentes-Reutilizables
```

### 2. Entra en el componente que quieras deployar

```bash
cd nombre-del-componente
```

### 3. Instala dependencias y despliega

```bash
npm install
sf project deploy start --target-org TU_ORG
```

## Herramientas compartidas

Este repositorio usa las siguientes herramientas a nivel raíz para todos los proyectos:

- **ESLint** con `@salesforce/eslint-config-lwc` — linting de LWC
- **Prettier** con `prettier-plugin-apex` — formateo de código
- **Jest** con `@salesforce/sfdx-lwc-jest` — tests unitarios
- **Husky** — git hooks (lint + tests en pre-commit)

## Requisitos previos

- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) instalado
- Node.js 18+
- Acceso a una org de Salesforce (Developer, Sandbox o Production)
