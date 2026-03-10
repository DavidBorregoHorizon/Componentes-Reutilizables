# Calendario Salesforce (FullCalendar LWC)

Componente Lightning Web Component que integra **FullCalendar V4** directamente en Salesforce. Permite mostrar en un calendario visual los registros de **cualquier objeto**, ya sea estándar (Eventos, Tareas, Casos…) o personalizado. No requiere código: se configura completamente desde el App Builder.

**Fuente original:** [effordDev/sf-calendar](https://github.com/effordDev/sf-calendar) — MIT License

---

## Vistas disponibles

El calendario incluye cuatro vistas que el usuario puede alternar con los botones de la cabecera:

<details>
  <summary>📅 Vista mensual (dayGridMonth) — vista por defecto</summary>
  <br>
  <img src="https://user-images.githubusercontent.com/36901822/164522086-c856aea6-5ea7-4659-9e51-20483b876d67.png" width="700">
</details>

<details>
  <summary>🗓️ Vista semanal con horas (timeGridWeek)</summary>
  <br>
  <img src="https://user-images.githubusercontent.com/36901822/164522656-9b30e1f2-5e25-4a4c-828b-ff5166e92aaa.png" width="700">
</details>

<details>
  <summary>📆 Vista diaria con horas (timeGridDay)</summary>
  <br>
  <img src="https://user-images.githubusercontent.com/36901822/164522888-ea92cc49-8b44-4210-b27c-4319a8885cc7.png" width="700">
</details>

<details>
  <summary>📋 Vista de lista semanal (listWeek)</summary>
  <br>
  <img src="https://user-images.githubusercontent.com/36901822/164520937-594e2119-ac57-421f-b65a-882ac9ad2cbb.png" width="700">
</details>

---

## Guía de configuración para administradores

> Esta sección está pensada para que cualquier persona con acceso a la configuración de Salesforce pueda poner en marcha el calendario **sin necesidad de saber programar**.

### Paso 1 — Despliega el componente en tu org

Tienes dos opciones:

**Opción A — Deploy con un clic (recomendado)**

Haz clic en el botón de abajo para desplegar directamente desde GitHub a tu org:

[![Deploy to Salesforce](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png)](https://githubsfdeploy.herokuapp.com?owner=effordDev&repo=sf-calendar)

**Opción B — Deploy manual con Salesforce CLI**

```bash
git clone https://github.com/effordDev/sf-calendar.git
cd sf-calendar
sf project deploy start --target-org <alias-de-tu-org>
```

---

### Paso 2 — Añade el componente a una página Lightning

1. Ve a la página donde quieras mostrar el calendario (página de registro, página de inicio, App Page…).
2. Haz clic en el engranaje ⚙️ → **Editar página**.
3. En el panel izquierdo de componentes, busca **"Custom Calendar"**.
4. Arrástralo hasta donde quieras colocarlo.
5. Con el componente seleccionado, verás un panel de propiedades a la derecha. Ahí es donde lo configuras.

---

### Paso 3 — Configura las propiedades del componente

Estas son las propiedades que debes rellenar en el App Builder:

| Propiedad | Descripción | Obligatorio |
|---|---|---|
| **Objeto hijo** | El objeto de Salesforce cuyos registros quieres mostrar como eventos | ✅ |
| **Campo de relación (parentFieldName)** | El campo del objeto hijo que apunta al registro padre (ej. la cuenta, el contacto…) | ✅ |
| **Campo de fecha de inicio** | El campo del objeto que indica cuándo empieza el evento | ✅ |
| **Campo de fecha de fin** | El campo del objeto que indica cuándo termina el evento | ✅ |
| **Campo de título** | El campo que se mostrará como nombre del evento en el calendario | ✅ |
| **Nombre del Platform Event** | Para activar la actualización automática del calendario (ver Paso 4) | ❌ Opcional |

> **¿Cómo sé el API Name de un campo o un objeto?**
> Ve a **Configuración → Gestor de objetos**, busca tu objeto, y en la pestaña **Campos y relaciones** verás la columna "Nombre de campo (API)". Los campos personalizados terminan siempre en `__c` y los objetos personalizados también.

---

### Ejemplos de configuración

#### Ejemplo 1 — Objeto estándar: Eventos de una Cuenta

Quieres ver en el calendario todos los Eventos relacionados con una Cuenta.

| Propiedad | Valor |
|---|---|
| Objeto hijo | `Event` |
| Campo de relación | `AccountId` |
| Campo de fecha de inicio | `StartDateTime` |
| Campo de fecha de fin | `EndDateTime` |
| Campo de título | `Subject` |

> El componente se coloca en la **página de registro de Cuenta**. Automáticamente usará el ID del registro actual para filtrar los eventos.

---

#### Ejemplo 2 — Objeto estándar: Casos de un Contacto

Quieres ver los Casos relacionados con un Contacto en un calendario (usando la fecha de creación y cierre).

| Propiedad | Valor |
|---|---|
| Objeto hijo | `Case` |
| Campo de relación | `ContactId` |
| Campo de fecha de inicio | `CreatedDate` |
| Campo de fecha de fin | `ClosedDate` |
| Campo de título | `Subject` |

> El componente se coloca en la **página de registro de Contacto**.

---

#### Ejemplo 3 — Objeto personalizado: Reservas de un Espacio

Tienes un objeto personalizado llamado **Reserva** (`Reserva__c`) con un campo de relación a **Espacio** (`Espacio__c`).

| Propiedad | Valor |
|---|---|
| Objeto hijo | `Reserva__c` |
| Campo de relación | `Espacio__c` |
| Campo de fecha de inicio | `Fecha_Inicio__c` |
| Campo de fecha de fin | `Fecha_Fin__c` |
| Campo de título | `Name` |

> El componente se coloca en la **página de registro de Espacio**. Mostrará todas las reservas de ese espacio concreto.

---

#### Ejemplo 4 — Objeto personalizado: Visitas a un Cliente

Tienes un objeto personalizado **Visita** (`Visita__c`) relacionado con una **Cuenta**.

| Propiedad | Valor |
|---|---|
| Objeto hijo | `Visita__c` |
| Campo de relación | `Cuenta__c` |
| Campo de fecha de inicio | `Fecha_Visita__c` |
| Campo de fecha de fin | `Fecha_Fin_Visita__c` |
| Campo de título | `Motivo__c` |

> El componente se coloca en la **página de registro de Cuenta**.

---

### Paso 4 — (Opcional) Activar la actualización automática

Por defecto, si alguien crea o modifica un evento mientras el calendario está abierto, el usuario necesita pulsar el botón **Refrescar** para ver los cambios. Si quieres que el calendario se actualice solo en tiempo real, sigue estos pasos:

#### 4.1 Crea un Platform Event

1. Ve a **Configuración → Integraciones → Platform Events**.
2. Haz clic en **Nuevo Platform Event**.
3. Dale un nombre descriptivo, por ejemplo: `Actualizacion_Calendario` (el API Name quedará como `Actualizacion_Calendario__e`).
4. En **Publish Behavior**, selecciona **Publish After Commit**.

   ![Crear Platform Event](https://user-images.githubusercontent.com/36901822/189163721-b0c35f28-e231-4782-861c-c3feb5c647e4.png)

5. Guarda.

#### 4.2 Crea un Flow que lance el Platform Event

1. Ve a **Configuración → Flows**.
2. Crea un nuevo Flow de tipo **Record-Triggered Flow** sobre el objeto que contiene tus eventos (ej. `Reserva__c`).

   ![Nuevo Flow](https://user-images.githubusercontent.com/36901822/189165985-c1b9859c-7ea0-4649-bd3a-5422de83c5f6.png)

3. En la configuración del trigger, selecciona **After the record is saved** y optimiza para **Actions and Related Records**.

   ![Configuración del trigger](https://user-images.githubusercontent.com/36901822/189166387-3305cede-c9a3-4a9d-8433-c1743af50d3f.png)

4. Añade un nodo **Create Records** y selecciona tu Platform Event como objeto a crear.

   ![Nodo Create Records](https://user-images.githubusercontent.com/36901822/189167019-d924e810-8274-4706-a4d9-275c1086952d.png)

5. No es necesario rellenar ningún campo del Platform Event (basta con crearlo). Guarda y activa el Flow.

#### 4.3 Conecta el Platform Event al calendario

1. Ve a la página Lightning donde tienes el calendario.
2. Edita la página y selecciona el componente de calendario.
3. En el campo **Platform Event Name**, pega el API Name del Platform Event que creaste (ej. `Actualizacion_Calendario__e`).

   ![Campo Platform Event](https://user-images.githubusercontent.com/36901822/189165307-fde17426-9bf1-4561-8bc7-1a9b6d913e69.png)

4. Guarda y activa la página.

A partir de ahora, cada vez que se cree o modifique un registro del objeto configurado, el calendario se actualizará automáticamente para todos los usuarios que lo tengan abierto.

---

## Resumen técnico

> Esta sección es para desarrolladores que necesiten entender, modificar o extender el componente.

### Componentes LWC

| Componente | `isExposed` | Descripción |
|---|---|---|
| `customCalendar` | ✅ `true` | Componente configurable por admins. Gestiona la lógica de negocio: llamadas Apex, formateo de datos, navegación a registros y escucha de platform events. |
| `calendar` | ❌ `false` | Motor interno que inicializa y renderiza FullCalendar V4. Expone métodos públicos `@api` para que `customCalendar` le envíe datos. |
| `calendarUtils` | — | Módulo de utilidades (no es un componente visual). Exporta `formatEvents()` para transformar sObjects en objetos FullCalendar, y `jsToApexDate()` para convertir fechas JS → formato Apex. |

#### Propiedades `@api` de `customCalendar`

| Propiedad | Tipo | Valor por defecto | Descripción |
|---|---|---|---|
| `recordId` | String | ID del registro actual | ID del registro padre para filtrar eventos |
| `childObject` | String | `Event` | API Name del objeto hijo |
| `parentFieldName` | String | `OwnerId` | Campo de relación del objeto hijo al padre |
| `startDatetimeField` | String | `StartDateTime` | Campo de fecha/hora de inicio |
| `endDatetimeField` | String | `EndDateTime` | Campo de fecha/hora de fin |
| `titleField` | String | `Subject` | Campo para el título del evento |
| `channelName` | String | — | API Name del Platform Event para auto-refresh |

#### Métodos `@api` de `calendar` (uso para extensión por devs)

| Método | Descripción |
|---|---|
| `setEvents(events)` | Reemplaza los eventos actuales con los nuevos |
| `setValidRanges(range)` | Restringe el rango de fechas navegables |

#### Eventos personalizados despachados por `calendar`

| Evento | Cuándo se dispara | Payload |
|---|---|---|
| `datechange` | Al navegar entre periodos | `{ startDate, endDate }` |
| `fceventclick` | Al hacer clic en un evento | Objeto `info` de FullCalendar |
| `fcdateclick` | Al hacer clic en una fecha vacía | Objeto `info` de FullCalendar |
| `eventmouseenter` | Al pasar el ratón sobre un evento | Objeto `info` de FullCalendar |

---

### Clases Apex

| Clase | Tipo | Descripción |
|---|---|---|
| `CustomCalendarHelper` | Clase de servicio | Método `@AuraEnabled getEvents(...)` que ejecuta una SOQL dinámica para recuperar registros del objeto configurado dentro del rango de fechas visible. |
| `CustomCalendarHelperTest` | Clase de test | Tests unitarios de `CustomCalendarHelper`. |
| `CustomPicklist` | `VisualEditor.DynamicPickList` | Genera dinámicamente el desplegable de objetos en el App Builder. Incluye todos los objetos personalizados (`__c`) y los estándar relevantes (excluye objetos de historial, etiquetas, compartición y feeds). |
| `CustomPicklistTest` | Clase de test | Tests unitarios de `CustomPicklist`. |

---

### Recursos estáticos (Static Resources)

| Recurso | Descripción |
|---|---|
| `fullCalendar` | Librería FullCalendar V4 empaquetada como `.zip`. Incluye plugins: `core`, `daygrid`, `timegrid`, `list`, `interaction`, `moment`, `moment-timezone`, y más de 60 ficheros de localización. |

---

### Metadata implicada

| Tipo | Nombre | Descripción |
|---|---|---|
| LWC | `customCalendar` | Componente principal configurable |
| LWC | `calendar` | Componente interno (motor FullCalendar) |
| LWC | `calendarUtils` | Utilidades JS (no visual) |
| Apex Class | `CustomCalendarHelper` | Lógica de consulta de datos |
| Apex Class | `CustomPicklist` | Picklist dinámica para App Builder |
| Static Resource | `fullCalendar` | Librería FullCalendar V4 (zip) |
| Lightning Page Targets | RecordPage, AppPage, HomePage, Community | Páginas donde puede desplegarse |

---

### Targets de despliegue

El componente `customCalendar` puede añadirse a:

- ✅ Páginas de registro (`lightning__RecordPage`)
- ✅ Páginas de app (`lightning__AppPage`)
- ✅ Página de inicio (`lightning__HomePage`)
- ✅ Páginas de comunidad / Experience Cloud (`lightningCommunity__Page`, `lightningCommunity__Default`)

---

### Notas para extensión por desarrolladores

El componente `calendar` (sin `custom`) está marcado como `isExposed: false` para que no aparezca en el App Builder. Está diseñado para ser reutilizado por otros LWCs. Si quieres construir tu propia lógica de negocio encima de FullCalendar, importa `c-calendar` en tu propio componente y usa sus métodos públicos `setEvents()` y `setValidRanges()`.

La función `formatEvents(events, config)` en `calendarUtils` transforma un array de sObjects de Salesforce (tal como los devuelve Apex) al formato de objetos de FullCalendar. Si el objeto tiene un campo de color (`Color__c` o similar), se puede descomentar la lógica de colores en `calendarUtils.js` para colorear los eventos dinámicamente.

---

**API Version:** 55.0 | **FullCalendar:** V4 | **Licencia:** MIT
