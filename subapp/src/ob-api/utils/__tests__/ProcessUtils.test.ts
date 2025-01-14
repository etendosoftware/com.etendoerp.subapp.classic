import bpprocess from "../../../../__tests__/mockdata/bpproc_setnewcurrency.json";
import ProcessUtils from "../ProcessUtils";

describe("User context test", () => {
  test("Get context in process", () => {
    const data = ProcessUtils.getParametersData(bpprocess);

    const dataExpected = {
      C_Currency_ID: "@BP_Currency_ID@",
      Amount: "N",
      Default_Conversion_Rate: "Y",
      Rate: "1",
      Foreign_Amount: "@SO_CreditUsed@",
      c_glitem_id: null
    };

    expect(data).toStrictEqual(dataExpected);
  });
});
