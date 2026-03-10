/**
 * @description Componente orquestador del calendario personalizado.
 *
 *              Este LWC actúa como "contenedor inteligente":
 *              - Recibe la configuración del admin (via @api)
 *              - Llama a Apex para obtener los eventos del rango visible
 *              - Escucha los eventos del hijo <c-calendar> (clic en evento, clic en fecha)
 *              - Navega al registro o al formulario de nuevo registro según la acción
 *              - Opcionalmente se suscribe a un Platform Event para refresco en tiempo real
 */
import { api, LightningElement } from "lwc"
import { NavigationMixin } from 'lightning/navigation'
import { subscribe } from 'lightning/empApi'
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils'
import Id from '@salesforce/user/Id'
import getEvents from "@salesforce/apex/CustomCalendarHelper.getEvents"
import { formatEvents } from "c/calendarUtils"

export default class CustomCalendar extends NavigationMixin(LightningElement) {

     // ─── Propiedades configurables desde App Builder ──────────────────────────

     /** ID del registro padre donde está colocado el calendario (auto-inyectado) */
     @api recordId

     /** API Name del objeto hijo a mostrar como eventos (ej: 'Event', 'Reserva__c') */
     @api childObject

     /** Campo de relación del hijo con el padre (ej: 'AccountId') */
     @api parentFieldName

     /** Campo de fecha/hora de inicio (ej: 'StartDateTime') */
     @api startDatetimeField

     /** Campo de fecha/hora de fin (ej: 'EndDateTime') */
     @api endDatetimeField

     /** Campo que se mostrará como título del evento (ej: 'Subject', 'Name') */
     @api titleField

     /** API Name del Platform Event para refresco en tiempo real (opcional) */
     @api channelName

     // ─── Estado interno ───────────────────────────────────────────────────────

     /** ID del usuario actual. Se usa como recordId de fallback en páginas de inicio */
     userId = Id

     /** Rango de fechas actualmente visible en el calendario */
     startDate
     endDate

     /** Referencia a la suscripción de EMP API (Platform Events) */
     subscription

     // ─── Ciclo de vida ────────────────────────────────────────────────────────

     connectedCallback() {
          // Escuchamos los eventos que dispara el hijo <c-calendar> usando bubbles+composed
          this.addEventListener('fceventclick', this.handleEventClick)
          this.addEventListener('fcdateclick', this.handleDateClick)

          // Si el admin configuró un Platform Event, nos suscribimos para refresco automático
          if (this.channelName) {
               this.handleSubscribe()
          }

          // En páginas de inicio no hay recordId, usamos el ID del usuario como filtro
          if (!this.recordId) {
               this.recordId = this.userId
          }
     }

     // ─── Platform Events (refresco en tiempo real) ────────────────────────────

     /**
      * @description Se suscribe al canal del Platform Event configurado.
      *              Cada vez que el evento se dispara (via Flow), el calendario
      *              llama a fetchEvents() y se actualiza automáticamente.
      *
      *              Para que funcione, el admin debe:
      *              1. Crear un Platform Event en Setup
      *              2. Crear un Flow que lo dispare al crear/editar registros
      *              3. Poner el API Name del Platform Event en la propiedad channelName
      */
     async handleSubscribe() {
          const messageCallback = (response) => {
               console.log('Platform Event recibido:', JSON.stringify(response))
               this.fetchEvents()
          }

          // Nos suscribimos desde el último mensaje (-1 = solo mensajes nuevos)
          const response = await subscribe(this.channel, -1, messageCallback)
          this.subscription = response
          console.log('Suscripción activa en:', JSON.stringify(response.channel))
     }

     /** Formatea el nombre del canal de EMP API */
     get channel() {
          return `/event/${this.channelName}`
     }

     // ─── Configuración para llamadas a Apex ───────────────────────────────────

     /**
      * @description Agrupa todos los parámetros de configuración en un objeto
      *              para pasarlos de forma limpia a getEvents() de Apex.
      */
     get config() {
          return {
               recordId:           this.recordId,
               childObject:        this.childObject,
               parentFieldName:    this.parentFieldName,
               startDatetimeField: this.startDatetimeField,
               endDatetimeField:   this.endDatetimeField,
               titleField:         this.titleField,
               startDate:          this.startDate,
               endDate:            this.endDate
          }
     }

     // ─── Handlers de eventos del hijo <c-calendar> ────────────────────────────

     /**
      * @description El calendario hijo emite 'datechange' cuando el usuario
      *              navega entre meses. Actualizamos el rango y recargamos eventos.
      */
     handleDateChange(event) {
          const { startDate, endDate } = event.detail.value
          this.startDate = startDate
          this.endDate   = endDate
          this.fetchEvents()
     }

     /**
      * @description Al hacer clic en un evento del calendario, navegamos al
      *              formulario de edición del registro correspondiente.
      *
      *              El Id del registro viene en extendedProps, que FullCalendar
      *              rellena automáticamente con las propiedades extra del objeto.
      */
     handleEventClick = (event) => {
          try {
               const { Id } = event.detail.value.event._def.extendedProps

               this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                         recordId:      Id,
                         objectApiName: this.childObject,
                         actionName:    'edit',
                    }
               })
          } catch (error) {
               console.error('Error al navegar al registro:', error)
          }
     }

     /**
      * @description Al hacer clic en una fecha vacía del calendario, abrimos
      *              el formulario de nuevo registro con la fecha y el padre
      *              pre-rellenados para facilitar la creación al usuario.
      */
     handleDateClick = (event) => {
          try {
               const date = event.detail.value.date

               // Codificamos los valores por defecto del nuevo registro:
               // - el campo de relación apunta al registro padre actual
               // - inicio y fin se pre-rellenan con la fecha clicada
               const defaultFieldValues = encodeDefaultFieldValues({
                    [this.parentFieldName]:    this.recordId,
                    [this.startDatetimeField]: date.toISOString(),
                    [this.endDatetimeField]:   date.toISOString()
               })

               this[NavigationMixin.Navigate]({
                    type: 'standard__objectPage',
                    attributes: {
                         objectApiName: this.childObject,
                         actionName:    'new',
                    },
                    state: {
                         defaultFieldValues,
                         navigationLocation: 'RELATED_LIST'
                    }
               })
          } catch (error) {
               console.error('Error al abrir formulario de nuevo registro:', error)
          }
     }

     // ─── Carga de datos ───────────────────────────────────────────────────────

     /**
      * @description Llama a Apex para obtener los eventos del rango visible
      *              y los pasa al hijo <c-calendar> para que los renderice.
      */
     async fetchEvents() {
          try {
               const rawEvents = await getEvents(this.config)
               const events    = formatEvents(rawEvents, this.config)
               this.template.querySelector('c-calendar').setEvents(events)
          } catch (error) {
               console.error('Error al cargar eventos:', error)
          }
     }
}
