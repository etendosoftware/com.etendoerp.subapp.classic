import React, { useContext } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import locale from "../../i18n/locale";
import { IRecord } from "../../types/Record";
import { CardDataParams } from "../../types/CardDataParams";
import TabContext from "../../contexts/TabContext";
import FormContext from "../../contexts/FormContext";
import { obIdentifierKey } from "../Tab";
import Reference from "../Reference";
import { IField } from "../Field";
import { INavigation } from "../Card";
import { APP_EVENT } from "../../contexts/MainAppContext";
import { NEW_RECORD } from "../../types/RouteParams";
import { componentsStyle } from "../../themes";
import ComponentWithFields from "../references/ComponentWithFields";

export interface RenderFieldsFunc {
  (fields: object[], record: IRecord): any;
}

export interface onSaveFunc {
  (state: { [key: string]: any }): Promise<any>;
}

export interface OnCardNavigation {
  (windowId: string, cardData: CardDataParams);
}

interface IRecordFormProps {
  fields?: object[];
  navigation?: INavigation;
  getRecordContext?: any;
}

class RecordForm extends ComponentWithFields<IRecordFormProps, {}> {
  static contextType = TabContext;

  render() {
    return (
      <FormContext.Provider
        value={{
          onChangeInput: (field: IField, value) => {
            this.context.currentRecord[field.columnName] = value;
          }, //changeInput,
          onChangeSelectorItem: (field: IField, value) => {
            this.context.currentRecord[field.columnName] = value;
          },
          onChangeSwitch: (field: IField, value) => {
            this.context.currentRecord[field.columnName] = value;
          },
          onChangeDateTime: (field: IField, value) => {
            this.context.currentRecord[field.columnName] = value;
          },
          onChangePicker: (field: IField, value) => {
            this.context.currentRecord[field.columnName] = value;
          },
          showSnackbar: this.context.showSnackbar,
          getRecordContext: this.context.getRecordContext,
          fields: this.props.fields,
          currentRecord: this.context.currentRecord
        }}
      >
        <View style={componentsStyle.formBody}>
          {this.renderFields(
            this.props.fields ? this.props.fields : [],
            this.context.currentRecord
          )}
        </View>
      </FormContext.Provider>
    );
  }
}

export default RecordForm;
