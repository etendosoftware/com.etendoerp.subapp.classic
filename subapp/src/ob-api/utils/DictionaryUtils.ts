import { IField } from "../../components/Field";
import { References } from "../../constants/References";
import { IRecord } from "../../types";

export class DictionaryUtils {
  /**
   * Converts the given value based on the reference.
   * @param reference The reference to use for conversion. Can be one 'References'.
   * @param value The value to convert.
   * @returns The converted value.
   */
  public static convertValue(reference: string, value: any) {
    switch (reference) {
      case References.YesNo:
        return value ? "Y" : "N";
      case References.Amount:
        return Number(value).toFixed(2);
      case References.Integer:
        return Number(value).toFixed(0);
    }
    return value;
  }

  /**
   * Converts the given value based on the reference.
   * @param reference The reference to use for conversion. Can be one 'References'.
   * @param value The value to convert.
   * @returns The converted value.
   */
  public static convertValuePrimitive(reference: string, value: any) {
    switch (reference) {
      case References.YesNo:
        return value ? true : false;
      case References.Amount:
        return Number(value);
      case References.Integer:
        return Number(value);
    }
    return value;
  }

  public static getInpRecord(
    windowId: string,
    record: IRecord,
    fields: IField[]
  ):{
    _entityName: string;
    inpwindowId: string;
    _params?;
  } {
    const context = {
      _entityName: record._entityName,
      inpwindowId: windowId
    };
    Object.entries(fields).forEach(([key, field]) => {
      if (field.column.keyColumn) {
        const columnIdentifier = field.column._identifier;
        context["keyProperty"] = key;
        context["keyColumnName"] = columnIdentifier;
        context["keyPropertyType"] = `_${key}_${field.column.reference}`;
        context["inpkeyColumnId"] = columnIdentifier;
        context["inpKeyName"] = `inp${field.inpName}`;
        context["inpTableId"] = field.column.table;
        context["inpTabId"] = field.tab;
        context[columnIdentifier] = record[key];
        return;
      }
      if (field.column.reference !== References.Button) {
        context[`inp${field.inpName}`] = this.convertValue(
          field.column.reference,
          record[key]
        );
      }
    });
    return context;
  }
}
