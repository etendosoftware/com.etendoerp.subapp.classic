import { OBRest, Restrictions } from "etrest";

export default class Languages {
  /**
   * Gets a desired window (must be accessible by current role).
   * Tabs and fields will be filtered based on role access
   * @param {string} id Window ID in OB
   * @returns A promise for the webservice call
   */
  static async getLanguages() {
    const criteria = OBRest.getInstance().createCriteria("ADLanguage");
    criteria.add(Restrictions.equals("systemLanguage", "true"));
    criteria.setMaxResults(100);
    return criteria.list();
  }
}
