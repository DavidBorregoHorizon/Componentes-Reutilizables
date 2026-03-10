/**
 * @description Backend del componente sf-calendar.
 *              Ejecuta una consulta SOQL dinámica para obtener los registros
 *              del objeto configurado dentro del rango de fechas visible.
 *
 *              Se invoca de forma imperativa desde customCalendar.js cada vez
 *              que el usuario navega entre meses/semanas en el calendario.
 */
public with sharing class CustomCalendarHelper {

    /**
     * @description Devuelve los registros del objeto hijo que pertenecen al
     *              registro padre y caen dentro del rango de fechas indicado.
     *
     * @param recordId           ID del registro padre (p.ej. una Cuenta)
     * @param childObject        API Name del objeto hijo (p.ej. 'Event', 'Reserva__c')
     * @param parentFieldName    Campo de relación en el hijo (p.ej. 'AccountId')
     * @param startDatetimeField Campo de fecha/hora de inicio (p.ej. 'StartDateTime')
     * @param endDatetimeField   Campo de fecha/hora de fin (p.ej. 'EndDateTime')
     * @param titleField         Campo que se mostrará como título del evento
     * @param startDate          Inicio del rango visible en el calendario
     * @param endDate            Fin del rango visible en el calendario
     * @return                   Lista de sObjects con los campos solicitados
     */
    @AuraEnabled(cacheable=true)
    public static List<sObject> getEvents(
        String recordId,
        String childObject,
        String parentFieldName,
        String startDatetimeField,
        String endDatetimeField,
        String titleField,
        Date startDate,
        Date endDate) {

        // Todos los parámetros de configuración son obligatorios
        if (recordId == null || childObject == null || parentFieldName == null ||
            startDatetimeField == null || endDatetimeField == null || titleField == null) {
            throw new AuraHandledException('Missing Config');
        }

        // Convertimos Date a DateTime para poder filtrar por campos DateTime en SOQL
        DateTime startDateTime = DateTime.newInstance(startDate.year(), startDate.month(), startDate.day());
        DateTime endDateTime   = DateTime.newInstance(endDate.year(), endDate.month(), endDate.day());

        // Escapamos el recordId para prevenir SOQL injection.
        // Los nombres de objeto y campo vienen de la config de App Builder (solo admins),
        // por lo que su riesgo de inyección es considerablemente menor.
        String safeRecordId = String.escapeSingleQuotes(recordId);

        // Construimos la query dinámica con los campos configurados en el componente
        String query = 'SELECT Id, ' + titleField + ', ';
        query += startDatetimeField + ', ' + endDatetimeField;
        query += ' FROM '  + childObject;
        query += ' WHERE ' + parentFieldName + ' = \'' + safeRecordId + '\'';
        query += ' AND '   + startDatetimeField + ' >= :startDateTime';
        query += ' AND '   + endDatetimeField   + ' <= :endDateTime';

        System.debug('CustomCalendarHelper query: ' + query);
        return Database.query(query);
    }
}
