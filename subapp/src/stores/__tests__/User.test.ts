import bprecord from "../../../__tests__/mockdata/bprecord.json";
import bprecordfields from "../../../__tests__/mockdata/bprecordfields.json";
import process from "../../../__tests__/mockdata/bpproc_setnewcurrency.json";
import UserUtils from "../utils/UserUtils";
import ProcessUtils from "../../ob-api/utils/ProcessUtils";

const user = {
  data: {
    userId: "0",
    defaultRoleId: "1",
    client: "2",
    organization: "3"
  }
};

describe("User context test", () => {
  test("Get context in form", () => {
    const data = UserUtils.getContext(
      user,
      bprecord,
      bprecordfields,
      bprecord._entityName
    );
    const dataExpected = {
      "@#AD_CLIENT_ID@": "2",
      "@#AD_ORG_ID@": "3",
      "@#AD_ROLE_ID@": "1",
      "@#AD_USER_ID@": "0",
      "@AD_USER_ID@": "0",
      "@BusinessPartner.client@": "23C59575B9CF467C9620760EB255B389",
      "@BusinessPartner.id@": "A6750F0D15334FB890C254369AC750A8",
      "@BusinessPartner.organization@": "B843C30461EA4501935CB1D125C9C25A",
      "@BusinessPartner.searchKey@": "ES-C1/0001"
    };
    expect(data).toStrictEqual(dataExpected);
  });
  test("Get context in process", () => {
    const params = ProcessUtils.getParametersData(process);
    expect(params).toStrictEqual({
      Amount: "N",
      C_Currency_ID: "@BP_Currency_ID@",
      Default_Conversion_Rate: "Y",
      Foreign_Amount: "@SO_CreditUsed@",
      Rate: "1",
      c_glitem_id: null
    });

    const data = UserUtils.resolveDefaultValue(
      bprecord,
      bprecordfields,
      params
    );

    const dataExpected = {
      Amount: "N",
      C_Currency_ID: "100",
      C_Currency_ID$_identifier: "USD",
      Default_Conversion_Rate: "Y",
      Foreign_Amount: 0,
      Rate: "1",
      c_glitem_id: null
    };
    expect(data).toStrictEqual(dataExpected);
  });
});
