import { createContext } from "react";
import { Field, IRecord } from "../types";

export interface FieldEvent {
  (field: Field, value: string, key: string, identifier?: string): void;
}

type IFormContext = {
  onChangeInput?: FieldEvent;
  onChangeSelectorItem?: FieldEvent;
  onChangeSwitch?: FieldEvent;
  onChangeDateTime?: FieldEvent;
  onChangePicker?: FieldEvent;
  onChangeAttribute?: FieldEvent;
  onChangeSelection?: (item: string) => void;
  onHideInput?: (value: string, key: string, canceled: boolean) => void;
  onHideSwitchModal?: (value: string, key: string, canceled: boolean) => void;
  showSnackbar?;
  getRecordContext?: (fields: Field[], currentRecord?: IRecord) => any;
  fields?;
  currentRecord?;
  onSubmit?;
};
const FormContext = createContext<IFormContext>({});

export default FormContext;
