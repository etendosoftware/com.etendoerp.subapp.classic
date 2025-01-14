import { action, observable } from "mobx";
import { create, persist } from "mobx-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ADWindow from "../ob-api/objects/ADWindow";
import { IOBDalEntity } from "../ob-api/classes/OBDal";
import { ITabRoute } from "../types/TabRoute";
import { ADTab } from "../ob-api/objects/ADTab";

class Windows {
  id = Math.random();
  @observable loading;
  @observable error;
  @observable hydrated = false;
  @persist("list") @observable windows = [];
  @persist("list") @observable menuItems = [];
  cacheWindow = null;

  async loadWindows(language) {
    try {
      const response = await ADWindow.getWindows(language.replace("-", "_"));
      this.windows = response.windows;
      this.menuItems = this.getMenuItems();
    } catch (error) {
      throw new Error(error);
    } finally {
      this.hydrated = false;
    }
  }

  @action
  unloadWindows() {
    this.windows = [];
    this.menuItems = [];
  }

  getWindow(id) {
    if (this.cacheWindow && this.cacheWindow.id === id) {
      return this.cacheWindow;
    } else {
      return this.windows.find(w => {
        return w.id === id;
      });
    }
  }

  getTabById(windowId, tabId): ADTab {
    const win = this.getWindow(windowId);
    return win.tabs.find(tab => {
      return tab.id == tabId;
    });
  }

  getTab(windowId, sequence = 10, level = 0) {
    const win = this.getWindow(windowId);
    return win.tabs.find(tab => {
      return tab.sequenceNumber == sequence && tab.tabLevel == level;
    });
  }

  getTabs(windowId, level = 0) {
    const win = this.getWindow(windowId);
    return win.tabs.filter(tab => {
      return tab.tabLevel == level;
    });
  }

  getTabRoutes(windowId, tabLevel = 0, tabKey = null): ITabRoute[] {
    var tabs = this.getTabs(windowId, tabLevel);
    if (tabKey !== null && tabKey !== 0) {
      tabs = tabs.filter(t => t.sequenceNumber === tabKey);
    }
    const routes: ITabRoute[] = [];
    tabs.map((tab, index) => {
      routes[index] = {
        key: tab.sequenceNumber,
        title: tab.name
      };
    });
    return routes;
  }

  getTabProcesses(tab) {
    let result = [];

    result = Object.keys(tab.fields)
      .filter(f => tab.fields[f].process)
      .map(f => tab.fields[f].process);

    return result;
  }

  getTabProcessesById(windowId, tabId) {
    const tab = this.getTabById(windowId, tabId);
    let result = [];

    result = Object.keys(tab.fields)
      .filter(f => tab.fields[f].process)
      .map(f => tab.fields[f].process);

    return result;
  }

  @action
  getMenuItems() {
    return this.windows.map(win => {
      return {
        key: win.id,
        label: win._identifier,
        windowId: win.id,
        windowName: win.name,
        isSalesTransaction: win.salesTransaction
      };
    });
  }

  getWindowEntities(windowId): IOBDalEntity[][] {
    const windows = this.windows.filter(win => win.id === windowId);
    if (!windows || windows.length != 1) {
      console.error("getWindowEntites", "Wrong windowId");
    }
    const win = windows[0];
    const tabLevels = win.tabs.map(tab => tab.tabLevel);
    let entitesByLevel: IOBDalEntity[][] = [];
    tabLevels.forEach(level => {
      entitesByLevel[level] = win.tabs
        .filter(tab => tab.tabLevel === level)
        .map(tab => {
          return {
            level: tab.tabLevel,
            sequenceNumber: tab.sequenceNumber,
            entityName: tab.entityName,
            criteria: null,
            hqlOrderByClause: tab.hqlorderbyclause,
            parentColumns: tab.parentColumns
          };
        });
    });

    return entitesByLevel;
  }

  getEntity(
    level: string | number,
    seqNo: string | number,
    entitesByLevel?: IOBDalEntity[][]
  ): IOBDalEntity {
    const localEntities = entitesByLevel;
    let currentEntity: IOBDalEntity = null;
    if (localEntities && localEntities[level]) {
      currentEntity = localEntities[level].find((entity: IOBDalEntity) => {
        return entity.sequenceNumber == seqNo;
      });
    }
    return currentEntity;
  }
}

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true
});

const windows = new Windows();
hydrate("windows", windows).then(() => (windows.hydrated = true));
export default windows;
