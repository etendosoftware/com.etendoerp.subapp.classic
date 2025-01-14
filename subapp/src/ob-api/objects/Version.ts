import { OBRest } from "etrest";

export default class Version {
  /**
   * Get Core Version
   * @returns A promise for the webservice call
   */
  static async getVersion() {
    return OBRest.getInstance().callWebService(
      "com.smf.mobile.utils.Version",
      "GET",
      [],
      null
    );
  }
}
