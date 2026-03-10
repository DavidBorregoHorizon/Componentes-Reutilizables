/**
 * @description Utilidades compartidas del calendario.
 *              Módulo de servicio: sin HTML, sin UI, solo funciones puras.
 */

/**
 * @description Transforma registros de Apex al formato que espera FullCalendar.
 *
 *              FullCalendar requiere { id, title, start, end } en cada evento.
 *              Los campos reales (StartDateTime, Subject...) se mapean usando
 *              la configuración que el admin estableció en App Builder.
 *
 *              Las propiedades originales del sObject se conservan en el objeto,
 *              por lo que siguen accesibles en extendedProps al hacer clic.
 *
 * @param {Array}  events  Registros devueltos por CustomCalendarController.getEvents
 * @param {Object} config  Configuración del componente (nombres de campos, etc.)
 * @returns {Array} Eventos listos para FullCalendar
 */
const formatEvents = (events, config) => {
     return events.map(event => {
          event.id    = event.Id                          // ID del registro (FullCalendar lo usa internamente)
          event.title = event[config.titleField]          // Texto visible en el bloque del evento
          event.start = event[config.startDatetimeField]  // Fecha/hora de inicio
          event.end   = event[config.endDatetimeField]    // Fecha/hora de fin
          return event
     })
}

/**
 * @description Convierte un Date de JS a 'YYYY-MM-DD' para enviarlo a Apex.
 *              Apex recibe Strings y los convierte a tipo Date internamente.
 *
 * @param {Date} date
 * @returns {String} 'YYYY-MM-DD'
 */
const jsToApexDate = (date) => {
     const year  = date.getFullYear()
     const month = String(date.getMonth() + 1).padStart(2, '0')
     const day   = String(date.getDate()).padStart(2, '0')
     return `${year}-${month}-${day}`
}

export { formatEvents, jsToApexDate }