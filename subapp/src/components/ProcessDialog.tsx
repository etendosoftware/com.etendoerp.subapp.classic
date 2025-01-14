import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { TextInput, Snackbar, FAB } from "react-native-paper";
import FormContext from "../contexts/FormContext";
import locale from "../i18n/locale";
import { IOBDalEntity, OBDal } from "../ob-api/classes/OBDal";
import { Field, IRecord } from "../types";
import { defaultTheme } from "../themes";
import { INavigation } from "./Card";
import Selector from "./references/Selector";
import Switch from "./references/Switch";
import { DictionaryUtils } from "../ob-api/utils/DictionaryUtils";
import UserUtils from "../stores/utils/UserUtils";
import { IField } from "./Field";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { References } from "../constants/References";
import List from "./references/List";

const OUTPUT_PARAM = "mobile_json";
const OUTPUT_REFERENCE_ID = "34380BB3AD5446EBB41540FE956C0F66";
const OB_IDENTIFIER_KEY = "$_identifier";

export interface ProcessDialogProps {
  process: any;
  qtyReturnKeyType?: any;
  hideDialog: any;
  doProcess: any;
  visible: boolean;
  isFAB: boolean;
  cancelDisabled?: boolean;
  loading: any;
  okDisabled?: boolean;
  entity: IOBDalEntity;
  recordId: string;
  context: any;
  onDone: any;
  selectedRecordsIds: any;
  navigation?: INavigation;
  currentRecord: IRecord;
  fields: IField[];
  eventEmitter: any;
}

export interface ProcessDialogState {
  data?: object;
  submits?: any;
  processSnackbarVisible?: boolean;
  processSnackbarMessage?: string;
  processSnackbarAction?: any;
  processSnackbarDuration?: number;
  processSnackbarOnDismiss?: any;
  unSupportedProcess: boolean;
}

export default class ProcessDialog<
  P extends ProcessDialogProps,
  S extends ProcessDialogState
> extends React.Component<P, S> {
  static OUTPUT_PARAM = OUTPUT_PARAM;
  static OUTPUT_REFERENCE_ID = OUTPUT_REFERENCE_ID;
  static OB_IDENTIFIER_KEY = OB_IDENTIFIER_KEY;

  inputs: object;
  preRenderDialogContent: any = null;
  postRenderDialogContent: any = null;

  constructor(props) {
    super(props);

    let paramMap = {
      data: {},
      submits: {},
      processSnackbarVisible: false,
      processSnackbarOnDismiss: this.onDismissSnackbar,
      processSnackbarAction: {
        label: locale.t("DismissSnackBar"),
        onPress: this.onDismissSnackbar
      },
      processSnackbarDuration: Snackbar.DURATION_MEDIUM,
      processSnackbarMessage: "",
      unSupportedProcess: false,
      parameter: {},
      showDatePicker: false
    };
    //remove defaultvalues
    //paramMap.data = ProcessUtils.getParametersData(this.props.process);
    paramMap.data = UserUtils.resolveDefaultValue(
      this.props.currentRecord,
      this.props.fields,
      paramMap.data
    );

    Object.entries(paramMap.data).forEach(([key, value]) => {
      if (paramMap.data[key] === "Y") {
        paramMap.data[key] = true;
      }
      if (paramMap.data[key] === "N") {
        paramMap.data[key] = false;
      }
    });
    // @ts-ignore
    this.state = paramMap;
    this.inputs = {};
  }

  changeInput = (
    field: Field,
    value: string,
    key?: string,
    identifier?: string
  ) => {
    const newState = this.state.data;
    if (field.columnName) {
      newState[field.columnName] = value;
    } else {
      newState[field.dBColumnName] = value;
    }
    if (identifier) {
      newState[`${field.columnName}$_identifier`] = identifier;
    }
    this.setState({ data: newState });
  };

  changeSwitch = (
    field: Field,
    value: string,
    key: string,
    identifier?: string
  ) => {
    const newState = this.state.data;

    newState[field.columnName] = DictionaryUtils.convertValue(
      field.reference,
      value
    );
    if (identifier) {
      newState[`${field.columnName}$_identifier`] = identifier;
    }
    this.setState({ data: newState });
  };

  toggleDatePicker = (parameter?: any) => {
    if (parameter) {
      this.setState({ parameter: parameter });
    }
    this.setState({ showDatePicker: !this.state.showDatePicker });
  };

  handleDateChange = (columnName, date) => {
    this.toggleDatePicker();
    const newState = this.state.data;
    newState[columnName] = date;
    this.setState({ data: newState });
  };
  renderString(parameter) {
    return (
      <TextInput
        key={parameter.id}
        style={{
          marginBottom: 8
        }}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        onChangeText={input => {
          this.changeInput(parameter, input);
        }}
        value={this.state[parameter.dBColumnName]}
      />
    );
  }
  renderNumber(parameter) {
    return (
      <TextInput
        key={parameter.id}
        style={{
          marginBottom: 8,
          width: "100%"
        }}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        onChangeText={input => {
          this.changeInput(parameter, input);
        }}
        value={
          this.state.data[parameter.dBColumnName]
            ? this.state.data[parameter.dBColumnName].toString()
            : null
        }
        keyboardType={"decimalpad"}
        returnKeyType={this.props.qtyReturnKeyType || "done"}
      />
    );
  }

  renderSelector(parameter) {
    return (
      <Selector
        field={{
          id: parameter.id,
          name: parameter.name,
          readOnly: false,
          column: {
            updatable: true
          },
          textInputStyle: false,
          columnName: parameter.dBColumnName,
          reference: parameter.reference,
          value: this.state.data[parameter.dBColumnName]
        }}
        identifier={this.state.data[`${parameter.dBColumnName}$_identifier`]}
        selector={parameter.selector}
      />
    );
  }
  renderSwitch(parameter) {
    return (
      <Switch
        field={{
          id: parameter.id,
          name: parameter.name,
          readOnly: false,
          column: {
            updatable: true
          },
          reference: parameter.reference,
          textInputStyle: false,
          columnName: parameter.dBColumnName
        }}
        value={this.state.data[parameter.dBColumnName]}
      />
    );
  }

  renderList(parameter) {
    return (
      <List
        field={{
          id: parameter.id,
          name: parameter.name,
          readOnly: false,
          column: {
            updatable: true
          },
          reference: parameter.reference,
          textInputStyle: false,
          columnName: parameter.dBColumnName
        }}
        valueKey={parameter.dBColumnName}
        pickerItems={parameter.refList}
        value={
          this.state.data[parameter.dBColumnName]
            ? this.state.data[parameter.dBColumnName].toString()
            : null
        }
      />
    );
  }

  renderDate(parameter) {
    return (
      <TextInput
        key={parameter.id}
        style={{
          marginBottom: 8,
          width: "100%"
        }}
        editable={false}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        value={
          this.state.data[parameter.dBColumnName]
            ? this.formatForOutput(
                this.state.data[parameter.dBColumnName],
                parameter.reference
              )
            : null
        }
        right={
          <TextInput.Icon
            name="calendar-edit"
            onPress={() => this.toggleDatePicker(parameter)}
          />
        }
        keyboardType={"decimalpad"}
        returnKeyType={this.props.qtyReturnKeyType || "done"}
      />
    );
  }

  renderText(parameter) {
    return (
      <TextInput
        key={parameter.id}
        style={{
          marginBottom: 8
        }}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        onChangeText={input => {
          this.changeInput(parameter, input);
        }}
        value={this.state.data[parameter.dBColumnName]}
        maxLength={parameter.length}
        multiline
        numberOfLines={parameter.displayedRows}
        maxHeight={
          parameter?.displayedRows ? parameter?.displayedRows * 20 : 80
        }
        textAlignVertical="top"
      />
    );
  }

  renderInteger(parameter) {
    return (
      <TextInput
        key={parameter.id}
        style={{
          marginBottom: 8,
          width: "100%"
        }}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        onChangeText={input => {
          const filteredInput = input.replace(/\D/g, ""); // aquí se aplica el filtro
          this.changeInput(parameter, filteredInput); // se llama a la función para actualizar el estado del componente
        }}
        value={
          this.state.data[parameter.dBColumnName]
            ? this.state.data[parameter.dBColumnName].toString()
            : null
        }
        maxLength={parameter.length}
        keyboardType={"decimal-pad"}
        returnKeyType={this.props.qtyReturnKeyType || "done"}
      />
    );
  }

  renderPassword(parameter) {
    const isPasswordVisible =
      this.state[`isPasswordVisible_${parameter.dBColumnName}`] ?? false;
    return (
      <TextInput
        key={parameter.id}
        style={{ marginBottom: 8, fontSize: 16 }}
        allowFontScaling={false}
        mode="outlined"
        dense
        label={parameter.name}
        ref={input => {
          this.inputs[parameter.dBColumnName] = input;
        }}
        onChangeText={input => {
          this.changeInput(parameter, input);
        }}
        blurOnSubmit={false}
        value={
          this.state.data[parameter.dBColumnName]
            ? this.state.data[parameter.dBColumnName].toString()
            : null
        }
        secureTextEntry={!isPasswordVisible}
        maxLength={parameter.length}
        right={
          <TextInput.Icon
            onPress={() => {
              const newState = {};
              newState[
                `isPasswordVisible_${parameter.dBColumnName}`
              ] = !isPasswordVisible;
              this.setState(newState);
            }}
            forceTextInputFocus={false}
            icon={!isPasswordVisible ? "eye-off-outline" : "eye-outline"}
          />
        }
      />
    );
  }

  renderParameterInput = parameter => {
    const { reference } = parameter;
    switch (reference) {
      case References.String:
        return this.renderString(parameter);
      case References.Quantity:
      case References.GeneralQuantity:
      case References.Number:
      case References.Amount:
        return this.renderNumber(parameter);
      case References.OBUISEL_SelectorReference:
        return this.renderSelector(parameter);
      case References.YesNo:
        return this.renderSwitch(parameter);
      case References.List:
        return this.renderList(parameter);
      case References.Date:
        return this.renderDate(parameter);
      case References.Text:
        return this.renderText(parameter);
      case References.Integer:
        return this.renderInteger(parameter);
      case References.PasswordDecryptable:
        return this.renderPassword(parameter);
      default:
        this.setState({ unSupportedProcess: true });
        console.warn(`Unsupported reference type: ${reference}`);
        return null;
    }
  };

  renderDialogContent() {
    return this.props.process.parameters.map(parameter => {
      if (parameter.referenceSearchKey !== OUTPUT_REFERENCE_ID) {
        return this.renderParameterInput(parameter);
      }
    });
  }
  showSnackbar = (
    processSnackbarMessage,
    action = this.onDismissSnackbar,
    actionLabel = locale.t("DismissSnackBar"),
    processSnackbarDuration = Snackbar.DURATION_MEDIUM
  ) => {
    const processSnackbarAction = {
      label: actionLabel,
      onPress: action
    };

    this.setState({
      processSnackbarVisible: true,
      processSnackbarMessage,
      processSnackbarAction,
      processSnackbarDuration
    });
  };

  onDismiss = () => {
    this.props.hideDialog();
  };

  onDismissSnackbar = () => {
    this.setState({ processSnackbarVisible: false });
  };

  onCancelPressed = () => {
    this.props.hideDialog();
  };

  onDonePressed = () => {
    this.defaultOnDonePressed().then(() => this.props.onDone());
  };

  defaultOnDonePressed = async () => {
    const data = this.state.data;
    Object.entries(data).forEach(([key, value]) => {
      if (data[key] === "Y") {
        data[key] = true;
      }
      if (data[key] === "N") {
        data[key] = false;
      }
    });
    await this.props.doProcess(
      this.props.process,
      this.props.process.parameters,
      this.state.data,
      this.props.currentRecord,
      this.props.fields
    );
    let refreshedRecord = await OBDal.refresh(this.props.currentRecord);
    // iterate over all refreshedRecord keys and update this.props.currentRecord
    // with the refreshedRecord values
    Object.entries(refreshedRecord).forEach(([key, value]) => {
      this.props.currentRecord[key] = value;
    });
  };

  formatForOutput = (date: Date, reference: any) => {
    return locale.formatDate(date, locale.getServerDateFormat(reference));
  };

  getTitle = () => {
    return this.props.process.name;
  };
  getContext = () => {
    return this.props.context;
  };
  render() {
    const dateValue = new Date();

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            position: "relative",
            flexDirection: "column",
            backgroundColor: defaultTheme.colors.backgroundSecondary
          }}
        >
          {!this.state.unSupportedProcess && (
            <View
              style={{
                flexDirection: "column",
                marginTop: 50,
                marginHorizontal: 20
              }}
            >
              <FormContext.Provider
                value={{
                  getRecordContext: this.getContext,
                  onChangeInput: this.changeInput,
                  onChangeSelectorItem: this.changeInput,
                  onChangeSwitch: this.changeSwitch,
                  onChangePicker: this.changeInput
                }}
              >
                {this.renderDialogContent()}
              </FormContext.Provider>
            </View>
          )}

          {this.state.unSupportedProcess && (
            <View
              style={{ width: "100%", height: "100%", marginHorizontal: 20 }}
            >
              <Text>{locale.t("Process:unSupported")}</Text>
            </View>
          )}
        </ScrollView>
        <FAB
          style={styles.secondaryFab}
          small={false}
          icon="content-save"
          onPress={this.onDonePressed}
        />
        {this.state.showDatePicker && (
          <RNDateTimePicker
            is24Hour // Android only
            mode={"date"}
            onChange={(event, date) => {
              console.log(event);
              if (event.type !== "dismissed") {
                this.handleDateChange(new Date(), date);
              }
            }}
            onTouchCancel={() => this.toggleDatePicker()}
            display="spinner"
            value={dateValue}
            neutralButtonLabel="Clear"
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  secondaryFab: {
    position: "absolute",
    bottom: 50,
    right: 16,
    zIndex: 1000,
    backgroundColor: defaultTheme.colors.primary,
    fontSize: 30
  }
});
