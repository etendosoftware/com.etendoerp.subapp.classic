import { OBRest } from "etrest";

/*
    ::OBDatasource

    Objeto base utilitario para consultas al servlet DataSourceServlet.
*/

const WS_PREFIX =
  "com.smf.securewebservices.datasource/org.openbravo.service.datasource/";

export default class OBDatasource {
  /*
      OBDatasource.fetch
      Realiza una consulta al datasource definido a partir del constructor.
  */
  static async fetch(
    {
      datasourceName = null,
      _selectorDefinitionId = null,
      treeReferenceId = null,
      _currentValue = null,
      _sortBy = "_identifier",
      _selectedProperties = "id",
      _extraProperties = null,
      _noCount = true,
      _OrExpression = true,
      fieldId = null,
      operator = null,
      _constructor = null,
      criteria = null,
      _startRow = 0,
      _endRow = 75,
      _textMatchStyle = "substring",
      context = null
    },
    fieldType = null
  ) {
    try {
      const _operationType = "fetch";
      const _context = context || {};
      let parentId = null;

      if (fieldType && fieldType == "Tree Reference" && treeReferenceId) {
        parentId = "-1";
      }

      const args = {
        _selectorDefinitionId,
        _currentValue,
        _sortBy,
        _selectedProperties,
        _extraProperties,
        _noCount,
        _OrExpression,
        fieldId,
        operator,
        _constructor,
        criteria,
        _operationType,
        _startRow,
        _endRow,
        _textMatchStyle,
        treeReferenceId,
        parentId,
        ..._context
      };

      if (!args._currentValue) {
        // avoid sendind string with 'null' or 'undefined'
        delete args._currentValue;
      }
      if (!args.criteria) {
        delete args.criteria;
      }

      //Remove tabId property for Tree Selectors, this way it prioritize the treeReferenceId on search.
      if (fieldType && fieldType == "Tree Reference") {
        delete args.tabId;
      }

      let encodedData: any = Object.keys(args)
        .map(key => {
          if (key === "criteria" && args[key]) {
            const criterias = args[key];
            return criterias.map(
              crit => `criteria=${encodeURIComponent(JSON.stringify(crit))}`
            );
          }
          // Convert boolean values to Y/N
          if (key.startsWith("inp") && typeof args[key] === "boolean") {
            args[key] = args[key] ? "Y" : "N";
          }
          return `${key}=${encodeURIComponent(args[key])}`;
        })
        .join("&");

      const response = await OBRest.getInstance().callWebService(
        WS_PREFIX + datasourceName,
        "POST",
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        encodedData
      );

      if (response.response?.error) {
        throw new Error(response.response?.error.message);
      } else {
        return response.response;
      }
    } catch (err) {
      throw err;
    }
  }
}
