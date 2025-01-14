import { createContext } from "react";
import { IRecord } from "../types/Record";
import { ILoadFieldsFunction } from "../components/Tab";
import { IOBDalEntity } from "../ob-api/classes/OBDal";
import { FabAction } from "../types/FabAction";
import { ADTab } from "../ob-api/objects/ADTab";

type ITabContext = {
  onSave?: any;
  currentRecord?: IRecord;
  setCurrentRecord?: (record: IRecord) => void;
  currentTab?: ADTab;
  identifiers?: any;
  loadFields?: ILoadFieldsFunction;
  fields?: any;
  getFieldValue?: any;
  entitiesByLevel?: any;
  windowId?: string;
  windowName?: string;
  tabLevel?: number;
  tabSequence?: number;
  tabIndex?: string;
  entityType?: IOBDalEntity;
  isSalesTransaction?: boolean;
  displayedIdentifiers?: any;
  eventSubscribe?: any;
  eventUnsubscribe?: any;
  eventEmitter?: any;
  showSnackbar?: any;
  loadDefaultValues?: any;
  getRecordContext?: any;
  selectedRecords?: any;
  selectRecords?: any;
  onLongPress?: any;
  multipleSelectionMode?: any;
  fabActions?: FabAction[];
};

const TabContext = createContext<ITabContext>({});

export default TabContext;
