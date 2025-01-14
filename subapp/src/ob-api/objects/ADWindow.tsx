import { OBRest } from "etrest";

export default class ADWindow {
  /**
   * Gets a desired window (must be accessible by current role).
   * Tabs and fields will be filtered based on role access
   * @param {string} id Window ID in OB
   * @returns A promise for the webservice call
   */
  static async getWindow(id, language) {
    return OBRest.getInstance().callWebService(
      `com.smf.mobile.utils.Window?windowId=${id}&language=${language}`,
      "GET",
      [],
      null
    );
  }

  /**
   * Gets all windows accesible by current role (based on token)
   * @returns A promise for the webservice call
   */
  static async getWindows(language) {
    return OBRest.getInstance().callWebService(
      `com.smf.mobile.utils.Window?language=${language}`,
      "GET",
      [],
      null
    );
  }
}
