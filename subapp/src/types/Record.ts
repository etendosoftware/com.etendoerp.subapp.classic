import { OBObject } from "etrest";
import { IObservableObject } from "mobx";

export interface IRecord extends OBObject {
  isNew?: boolean;
  name?: string;
}

export type IRecordObservable = IRecord & IObservableObject;

export interface OnRecordSavedFunction {
  (props: any): void;
}
