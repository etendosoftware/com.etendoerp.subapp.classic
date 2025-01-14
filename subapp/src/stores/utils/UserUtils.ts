import { IField } from "../../components/Field";
import { IRecord } from "../../types";

export default class UserUtils {
  /**
   * Method to replace context values
   * @param user 
   * @param record 
   * @param fields 
   * @param entityName 
   * @returns 
   */
  public static getContext(
    user: {
      data: {
        userId: string;
        defaultRoleId: string;
        client: string;
        organization: string;
      };
    },
    record?: IRecord,
    fields?: IField[],
    entityName?: string
  ) {
    const context = {};

    if (record && fields && entityName) {
      Object.keys(fields).forEach(key => {
        if (fields[key].column.storedInSession) {
          context["@" + entityName + "." + fields[key].columnName + "@"] =
            record[key];
        }
      });
      context[`@${entityName}.id@`] = record.id;
    }

    // Add session variables to context
    if (user.data) {
      context["@AD_USER_ID@"] = user.data.userId;
      context["@#AD_USER_ID@"] = user.data.userId;
      context["@#AD_ROLE_ID@"] = user.data.defaultRoleId;
      context["@#AD_CLIENT_ID@"] = user.data.client;
      context["@#AD_ORG_ID@"] = user.data.organization;
    }

    return context;
  }

  /**
  * Resolves the default value of a parameter by replacing placeholders with actual values from a record
  * @param {Object} record - The record object containing the values to be used for replacement
  * @param {Object} fields - The fields object containing the identifier for the columns
  * @param {Object} params - The parameters object to have its placeholders resolved
  * @return {Object} params - The parameters object with placeholders replaced by actual values
  */
  public static resolveDefaultValue(record, fields, params:string[]) {
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value?.startsWith("@") && value.endsWith("@")) {
        value = value.replace(/^@|@$|^'|'$|^"|"$/g, "");
        Object.keys(fields).forEach(key => {
          if (fields[key]?.column?._identifier == value) {
            if(record[`${key}$_identifier`]) {
              params[`${paramKey}$_identifier`] = record[`${key}$_identifier`];
            }
            value = record[key];
          }
        });
      }
      params[paramKey] = value;
    });
    return params;
  }
}
