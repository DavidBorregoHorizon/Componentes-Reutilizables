/**
 * @description Picklist dinámica que rellena el desplegable "Objeto relacionado"
 *              en el panel de configuración del componente (App Builder / Lightning Pages).
 *
 *              Extiende VisualEditor.DynamicPickList para que Salesforce la reconozca
 *              como fuente de datos del atributo 'datasource' en el js-meta.xml.
 *
 *              ⚠️  Usa Schema.getGlobalDescribe(), que carga todos los objetos de la org.
 *              En orgs muy grandes puede ser lento, pero solo se ejecuta en tiempo de
 *              diseño (App Builder), nunca en tiempo de ejecución para usuarios finales.
 */
global with sharing class CustomPicklist extends VisualEditor.DynamicPickList {

    /**
     * @description Valor seleccionado por defecto cuando se añade el componente
     *              por primera vez a una página Lightning.
     */
    global override VisualEditor.DataRow getDefaultValue() {
        return new VisualEditor.DataRow('Account', 'Account');
    }

    /**
     * @description Devuelve la lista de objetos disponibles para configurar.
     *              Incluye todos los objetos estándar y personalizados (__c),
     *              excluyendo objetos de auditoría, etiquetas, permisos y feeds
     *              que no tienen sentido como objeto de eventos del calendario.
     */
    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows myValues = new VisualEditor.DynamicPickListRows();

        for (Schema.SObjectType objTyp : Schema.getGlobalDescribe().values()) {
            String apiName = objTyp.getDescribe().getName();
            String label   = objTyp.getDescribe().getLabel();

            // Los objetos personalizados (__c) siempre se incluyen
            if (apiName.toLowerCase().right(3) == '__c') {
                myValues.addRow(new VisualEditor.DataRow(label, apiName));
                continue;
            }

            // Objetos estándar: excluimos los relacionados con auditoría, etiquetas,
            // permisos compartidos y feeds de Chatter (no son útiles como eventos)
            if (!apiName.containsIgnoreCase('history') &&
                !apiName.containsIgnoreCase('tag')     &&
                !apiName.containsIgnoreCase('share')   &&
                !apiName.containsIgnoreCase('feed')) {
                myValues.addRow(new VisualEditor.DataRow(label, apiName));
            }
        }

        return myValues;
    }
}
