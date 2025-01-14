import { OBRest } from "etrest";

export default class PAttribute {
  /**
   * Gets the structure need to render an attribute selector
   * @param {string} id Attribute ID (optional)
   * @param {string} windowId Window ID in OB
   * @param {string} tabId Tab ID in OB
   * @param {string} productId Product ID
   * @param {string} description Attribute description (optional)
   * @returns A promise for the webservice call
   */
  static async getAttributes(id, windowId, tabId, productId, description) {
    const idParam = id ? `id=${id}` : "";
    const descriptionParam = description
      ? `description=${encodeURIComponent(description)}`
      : "";

    return OBRest.getInstance().callWebService(
      `com.smf.mobile.utils.ProductAttributes?${idParam}&windowId=${windowId}&tabId=${tabId}&productId=${productId}&${descriptionParam}`,
      "GET",
      [],
      null
    );
  }

  /**
   * Saves an Attribute Set in OB
   * @param {string} id Attribute ID
   * @param {object} data Attribute values (lot, serialno, etc)
   * @returns A promise for the webservice call
   */
  async saveAttribute(data) {
    return OBRest.getInstance().callWebService(
      `com.smf.mobile.utils.ProductAttributes`,
      "POST",
      [],
      data
    );
  }
}
