import "react-native";
import unmock from "unmock";
import { OBRest, OBObject } from "etrest";
import { Windows } from "../src/stores";
import { RecordService } from "../src/ob-api/services/RecordService";

jest.mock("../App", () => {
  return {
    eventSubscribe: jest.fn()
  };
});

global.fetch = require("node-fetch");

const URL = "http://localhost:8080/etendo";
const USER = "admin";
const PASS = "admin";
const PRODUCT_WINDOW_ID = "140";
const TAB_PRODUCT_ID = "180";
const ORDER_WINDOW_ID = "143";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("App", () => {
  beforeAll(() => {});
  beforeEach(() => {
    unmock.reset();
  }, 20000);
  it("test product", async () => {
    // @ts-ignore
    OBRest.init({ href: URL });
    await OBRest.loginWithUserAndPassword(USER, PASS);

    // @ts-ignore
    OBRest.init({ href: URL });
    await OBRest.loginWithUserAndPassword(USER, PASS);
    await Windows.loadWindows("en_US");

    const productWindow = Windows.getWindow(PRODUCT_WINDOW_ID);
    expect(productWindow.tabs.length).toBe(15);

    const productTab = Windows.getTabById(PRODUCT_WINDOW_ID, TAB_PRODUCT_ID);
    expect(productTab).not.toBeUndefined();

    const productTabProcess = Windows.getTabProcessesById(
      PRODUCT_WINDOW_ID,
      TAB_PRODUCT_ID
    );
    expect(productTabProcess.length).toBe(6);

    const tabs = Windows.getTabs(PRODUCT_WINDOW_ID);
    let processFound = [];
    tabs.map(tab => {
      const processes = Windows.getTabProcesses(tab);
      processFound = [...processFound, ...processes];
    });
    expect(processFound.length).toBe(6);
  }, 20000);
  it("test order", async () => {
    // @ts-ignore
    OBRest.init({ href: URL });
    await OBRest.loginWithUserAndPassword(USER, PASS);

    await Windows.loadWindows("en_US");

    const orderWindow = Windows.getWindow(ORDER_WINDOW_ID);
    expect(orderWindow.tabs.length).toBe(7);

    const tabs = Windows.getTabs(ORDER_WINDOW_ID);
    let processFound = [];
    tabs.map(tab => {
      const processes = Windows.getTabProcesses(tab);
      processFound = [...processFound, ...processes];
    });
    expect(processFound.length).toBe(6);
  }, 20000);
  it("get product", async () => {
    const TAB_LEVEL = 0;
    const SEQUENCE_NUMBER = 10;
    const PRODUCT_ID = "7206FAA45A3842659D93F59CCA2B0613";
    const NAME = "Cola 0,5L";

    // @ts-ignore
    OBRest.init({ href: URL });
    await OBRest.loginWithUserAndPassword(USER, PASS);
    await Windows.loadWindows("en_US");
    const entitiesByLevel = Windows.getWindowEntities(PRODUCT_WINDOW_ID);
    expect(entitiesByLevel.length).toBe(4);
    expect(entitiesByLevel[TAB_LEVEL]).toEqual([
      {
        level: 0,
        sequenceNumber: 10,
        entityName: "Product",
        criteria: null,
        hqlOrderByClause: null,
        parentColumns: []
      }
    ]);

    const currentEntity = Windows.getEntity(
      TAB_LEVEL,
      SEQUENCE_NUMBER,
      entitiesByLevel
    );
    expect(entitiesByLevel[TAB_LEVEL]).toEqual([currentEntity]);

    const productList = await OBRest.getInstance()
      .createCriteria(currentEntity.entityName)
      .setShowIdentifiers(true)
      .list();
    // TODO Search filter product
    interface OBProduct extends OBObject {
      name: string;
      updated: string;
    }
    let origProduct = productList.find(
      product => product.id === PRODUCT_ID
    ) as OBProduct;
    const preUpdated = origProduct.updated;

    origProduct._entityName = currentEntity.entityName;
    const modName1 = NAME + " " + Date.now();
    origProduct.name = modName1;
    const product = (await RecordService.onSave({
      ...origProduct
    })) as OBProduct;
    expect(product.name).toBe(modName1);
    //
    let errProd = null;
    let errMsg = null;
    origProduct.name = NAME;
    try {
      errProd = await RecordService.onSave(origProduct);
    } catch (e) {
      errMsg = e.toString();
    }
    expect(errMsg).toEqual(
      "Error: The record you are saving has already been changed by another user or process. Cancel your changes and refresh the data by clicking the refresh button."
    );
    expect(errProd).toBe(null);
    //
    product.name = NAME;
    expect(product.name).toBe(NAME);
    const updatedRecord = (await RecordService.onSave(product)) as OBProduct;
    const updated = updatedRecord.updated;
    expect(updatedRecord.name).toBe(NAME);
    //
    expect(preUpdated).not.toBe(updated);
  }, 25000);
  afterAll(() => {
    unmock.off();
  });
});
