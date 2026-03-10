# 📅 sf-calendar — Calendario Personalizado para Salesforce

Componente LWC que muestra cualquier objeto de Salesforce en formato de calendario interactivo, integrado en páginas Lightning (App Builder). Basado en [FullCalendar V4](https://fullcalendar.io/).

**Fuente original:** [effordDev/sf-calendar](https://github.com/effordDev/sf-calendar) — MIT License

![Vista del calendario](https://user-images.githubusercontent.com/36901822/164522656-9b30e1f2-5e25-4a4c-828b-ff5166e92aaa.png)

---

## ✨ Funcionalidades

- 📆 Vistas de mes, semana, día y lista
- 🖱️ Clic en evento → abre el registro en modo edición
- ➕ Clic en fecha vacía → abre formulario de nuevo registro con fecha y padre pre-rellenados
- 🌍 **Multidioma**: detecta automáticamente el idioma de la org (español, inglés, etc.)
- 💬 **Tooltip**: al pasar el ratón sobre un evento se muestra el título completo
- ⚡ **Refresco en tiempo real** con Platform Events (configuración opcional)
- 🔧 Configurable con cualquier objeto estándar o personalizado desde App Builder

---

## 🚀 Despliegue

Desde la carpeta `sf-calendar/`, ejecuta:

```bash
sf project deploy start --source-dir force-app --target-org <alias-de-tu-org>
```

---

## ⚙️ Configuración en App Builder

Una vez desplegado, edita la página Lightning donde quieras colocar el calendario y arrastra el componente **Custom Calendar**. En el panel derecho configura:

| Campo | Descripción | Ejemplo |
|---|---|---|
| **ID del registro** | Se rellena automáticamente. No modificar. | `!recordId` |
| **Objeto relacionado** | Objeto cuyos registros se mostrarán como eventos | `Event`, `Reserva__c` |
| **Campo de relación (API Name)** | Campo del objeto que apunta al registro padre | `AccountId`, `Cuenta__c` |
| **Campo de fecha de inicio** | Campo de fecha/hora de inicio del evento | `StartDateTime`, `Fecha_Inicio__c` |
| **Campo de fecha de fin** | Campo de fecha/hora de fin del evento | `EndDateTime`, `Fecha_Fin__c` |
| **Campo de título** | Campo que se mostrará como nombre del evento | `Subject`, `Name` |
| **Nombre del Platform Event** | *(Opcional)* Para refresco automático en tiempo real | `Calendar_Refresh__e` |

---

## 📋 Ejemplos de configuración

### ✅ Objeto estándar: Eventos de una Cuenta

| Campo | Valor |
|---|---|
| Objeto relacionado | `Event` |
| Campo de relación | `AccountId` |
| Campo de fecha de inicio | `StartDateTime` |
| Campo de fecha de fin | `EndDateTime` |
| Campo de título | `Subject` |

### ✅ Objeto personalizado: Reservas de una instalación

| Campo | Valor |
|---|---|
| Objeto relacionado | `Reserva__c` |
| Campo de relación | `Instalacion__c` |
| Campo de fecha de inicio | `Fecha_Inicio__c` |
| Campo de fecha de fin | `Fecha_Fin__c` |
| Campo de título | `Name` |

> 💡 Los campos personalizados siempre terminan en `__c`. Puedes encontrar los API Names en **Setup → Object Manager → [tu objeto] → Fields & Relationships**.

---

## ⚡ Refresco automático en tiempo real

> 🔔 **Esta funcionalidad es opcional pero muy recomendable.** Sin ella, el calendario solo se actualiza al navegar entre meses o pulsar el botón de refrescar manualmente.

Por defecto, si un compañero crea un evento mientras tú tienes la página abierta, **no lo verás** hasta que recargues. Para activar el **refresco automático en tiempo real** sigue estos 3 pasos:

### Paso 1 — Crear el Platform Event

1. Ve a **Setup → Platform Events → New Platform Event**
2. Rellena:
   - **Label**: `Calendar Refresh`
   - **Object Name** (API Name se rellena solo): `Calendar_Refresh__e`
   - No necesitas añadir campos
3. Guarda

### Paso 2 — Crear el Flow

1. Ve a **Setup → Flows → New Flow**
2. Selecciona **Record-Triggered Flow**
3. Configura:
   - **Object**: el mismo objeto que muestras en el calendario (ej: `Event`)
   - **Trigger**: `A record is created or updated`
4. Añade un elemento **Create Records**:
   - Tipo: `Calendar_Refresh__e`
   - Sin campos adicionales
5. Guarda y **Activa** el Flow

### Paso 3 — Configurar el componente

En App Builder, en el campo **Nombre del Platform Event**, escribe:

```
Calendar_Refresh__e
```

✅ A partir de ese momento el calendario se actualiza automáticamente para todos los usuarios con la página abierta, sin necesidad de recargar.

---

## 🧩 Arquitectura técnica

### Componentes LWC

| Componente | Descripción |
|---|---|
| `customCalendar` | Orquestador principal. Gestiona configuración, llamadas a Apex, navegación y suscripción a Platform Events |
| `calendar` | Motor visual. Inicializa y renderiza FullCalendar, emite eventos al padre |
| `calendarUtils` | Módulo de servicio. Funciones puras de transformación de datos (sin HTML ni UI) |

### Clases Apex

| Clase | Descripción |
|---|---|
| `CustomCalendarHelper` | Ejecuta la consulta SOQL dinámica para obtener los eventos del rango visible |
| `CustomCalendarHelperTest` | Tests unitarios de `CustomCalendarHelper` |
| `CustomPicklist` | Rellena el desplegable "Objeto relacionado" en App Builder |
| `CustomPicklistTest` | Tests unitarios de `CustomPicklist` |

### Static Resources

| Recurso | Descripción |
|---|---|
| `fullCalendar` | Librería FullCalendar V4 con todos sus plugins (dayGrid, timeGrid, list, interaction, moment, locales) |

### Flujo de datos

```
App Builder config (@api props)
        ↓
  customCalendar.js
        ↓ llamada imperativa a Apex
  CustomCalendarHelper.cls  ←→  Salesforce DB
        ↓ sObjects
  calendarUtils.js (formatEvents)
        ↓ eventos formateados { id, title, start, end }
  calendar.js → FullCalendar
        ↓
  Render en pantalla
```

### Multidioma

El componente detecta automáticamente el idioma del usuario mediante `@salesforce/i18n/lang` y carga el fichero de locale correspondiente de FullCalendar. Esto significa que los días de la semana, meses y textos del calendario aparecen en el idioma configurado en Salesforce para cada usuario.

---

## 🔒 Notas de seguridad

- La clase Apex usa `with sharing` — respeta las reglas de visibilidad del usuario
- El `recordId` se escapa con `String.escapeSingleQuotes()` para prevenir SOQL injection
- Los nombres de objeto y campo vienen de la configuración de App Builder (solo accesible por administradores)

---

## 📦 Dependencias

- Salesforce API version **62.0** o superior
- FullCalendar V4 (incluido en el Static Resource — no requiere instalación adicional)
