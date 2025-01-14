import { OBRest } from "etrest";

export default class EANType {
  static async getConfig(warehouseId, entityFilter) {
    const warehouseParam = warehouseId ? `warehouseId=${warehouseId}` : "";
    const entityFilterParam = entityFilter ? `entityName=${entityFilter}` : "";
    return OBRest.getInstance().callWebService(
      `com.smf.ean128.EANType?${warehouseParam}&${entityFilterParam}`,
      "GET",
      [],
      null
    );
  }
}
