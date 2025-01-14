import unmock from "unmock";
import { OBRest } from "etrest";
import { Windows } from "../src/stores";
import { UI_PATTERNS } from "../src/ob-api/constants/uiPatterns";

const URL = "http://localhost:8080/etendo";
const USER = "admin";
const PASS = "admin";
const PHYSICAL_INVENTORY_WINDOW_ID = "168";
const TAB_ACCOUNTING_ID = "93787F9E92BD433EA7FD0E61227BC126";
const TAB_HEADER_ID = "255";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("App", () => {
  beforeAll(() => {});
  beforeEach(() => {
    unmock.reset();
  });
  it("test behav", async () => {
    // @ts-ignore
    OBRest.init({ href: URL });
    await OBRest.loginWithUserAndPassword(USER, PASS);
    await Windows.loadWindows("en_US");

    const piWindow = Windows.getWindow(PHYSICAL_INVENTORY_WINDOW_ID);

    expect(piWindow.tabs.length).toBe(3);

    const headerTab = Windows.getTabById(
      PHYSICAL_INVENTORY_WINDOW_ID,
      TAB_HEADER_ID
    );
    expect(headerTab).not.toBeUndefined();

    expect(headerTab.uIPattern).toBe(UI_PATTERNS.STD);

    const accountingTab = Windows.getTabById(
      PHYSICAL_INVENTORY_WINDOW_ID,
      TAB_ACCOUNTING_ID
    );
    expect(accountingTab).not.toBeUndefined();

    expect(accountingTab.uIPattern).toBe(UI_PATTERNS.SR);
  }, 20000);
  afterAll(() => {
    unmock.off();
  });
});
