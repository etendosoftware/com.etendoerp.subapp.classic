import { createContext } from "react";
interface getBreadcrumbsFunction {
  (windowId: string): object;
}
type IMainAppContext = {
  selectedLanguage?: any;
  changeLanguage?: any;
  eventSubscribe?: any;
  eventUnsubscribe?: any;
  eventEmitter?: any;
  languages?: any[];
  updateLanguageList?: any;
  getBreadcrumbs: getBreadcrumbsFunction;
};

export enum APP_EVENT {
  RECORD_UPDATE
}

const MainAppContext = createContext<IMainAppContext>({});

export default MainAppContext;
