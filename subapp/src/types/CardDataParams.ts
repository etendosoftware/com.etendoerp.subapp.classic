import { IRecord } from "./Record";
import { IOBDalEntity } from "../ob-api/classes/OBDal";
import { IField } from "../components/Field";

/**
 * Params sended when navigation is called
 */
interface ICardDataParams {
  label: string;
  isSalesTransaction: boolean;
  windowId: string;
  windowName: string;
  entitiesByLevel: IOBDalEntity[];
  tabLevel: number;
  tabIndex?: string;
  currentRecordId?: string;
  parentRecordId?: string;
  parentEntity?: string;
  currentRecord?: IRecord;
  fields: IField[];
}

class CardDataParams {
  label: string;
  isSalesTransaction: boolean;
  windowId: string;
  windowName: string;
  entitiesByLevel: IOBDalEntity[];
  tabLevel: number;
  tabIndex?: string;
  currentRecordId?: string;
  parentRecordId?: string;
  parentEntity?: string;
  currentRecord?: IRecord;
  setCurrentEntity: React.Dispatch<React.SetStateAction<IRecord>>;

  constructor(props: ICardDataParams) {
    this.label = props.label;
    this.windowName = props.windowName;
    this.isSalesTransaction = props.isSalesTransaction;
    this.windowId = props.windowId;
    this.entitiesByLevel = props.entitiesByLevel;
    this.tabLevel = props.tabLevel;
    this.tabIndex = props.tabIndex;
    this.currentRecordId = props.currentRecordId;
    this.parentRecordId = props.parentRecordId;
    this.currentRecord = props.currentRecord;
    this.parentEntity = props.parentEntity;
  }

  route(routeKey: string, routeTitle: string) {
    this.tabIndex = routeKey;
    this.label = routeTitle;
    return this;
  }
}

export { CardDataParams };
export { ICardDataParams };
