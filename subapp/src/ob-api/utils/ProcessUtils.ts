import { References } from "../../constants/References";

export default class ProcessUtils {
  /**
   * Extracts parameter data from a process object and returns it in an object
   * @param {Object} process - The process object containing the parameters
   * @returns {Object} - An object containing the extracted parameter data
   */
  public static getParametersData(process: {
    parameters: {
      defaultValue: any;
      reference: References;
      dBColumnName: string;
    }[];
  }): object {
    return process.parameters.reduce((datum, parameter) => {
      let val = parameter.defaultValue;
      if (val) {
        val = val.replace(/^["']|["']$/g, "");
      }
      if (val === null && parameter.reference === References.YesNo) {
        val = "N";
      }
      datum[parameter.dBColumnName] = val;
      return datum;
    }, {});
  }
}
