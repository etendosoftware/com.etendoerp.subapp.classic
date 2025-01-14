import { createContext } from "react";
import { FabAction } from "../types/FabAction";
import { IRecord } from "../types/Record";

type IScreenContext = {
  windowId: string;
  currentRecord?: IRecord;
  entitiesByLevel?;
  selectedLanguage?: any;
  eventSubscribe?: any;
  eventUnsubscribe?: any;
  eventEmitter?: any;
  selectedRecords?: IRecord[];
  fabActions?: FabAction[];
  breadcrumbs?: string[];
};
const ScreenContext = createContext<IScreenContext>({});

export default ScreenContext;
