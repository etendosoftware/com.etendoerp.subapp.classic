import React from "react";
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
  View
} from "react-native";
import FormContext from "../contexts/FormContext";
import { componentsStyle } from "../themes";
import { Button, Chip, Dialog } from "react-native-paper";
import { Modal, Platform } from "react-native";
import { FieldMode, IField } from "./Field";
import locale from "../i18n/locale";
import { UI_PATTERNS } from "../ob-api/constants/uiPatterns";
import { References } from "../constants/References";

export interface InputFieldProps {
  referenceKey?: string;
  value?: string;
  valueKey?: string;
  field: IField;
  forceDisabled?: boolean;
  keyboardType?: any;
  multiline?: boolean;
  blurOnSubmit?: boolean;
  inputMode?: FieldMode;
  qtyReturnKeyType?: any;
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  onBlur: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  tabUIPattern?: string;
}

const SCAN_QTY_KEY_TYPE = Platform.OS === "ios" ? "done" : "next";

interface State {
  showModal: boolean;
  modalValue: string | number; // input state when shown in a modal, it will be sent back to the caller via the onHide() function
}

export class InputField extends React.Component<InputFieldProps, State> {
  static contextType = FormContext;
  inputRef: any;
  constructor(props: InputFieldProps) {
    super(props);
    this.inputRef = null;
    this.state = {
      showModal: false,
      modalValue:
        this.props.field.column?.mandatory === true
          ? this.props.value
          : this.props.value !== undefined
          ? this.props.value
          : ""
    };
  }

  focus = () => {
    this.inputRef?.focus();
  };
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ modalValue: this.props.value });
    }
  }

  onBlur = (input?: string | number) => {
    const localInput = input || this.state.modalValue;
    switch (this.props.referenceKey) {
      case References.Integer:
      case References.Number:
      case References.Quantity:
      case References.GeneralQuantity:
      case References.Price:
      case References.Amount:
        //FIXME: localize number inputs
        let numberInput = Number(localInput?.toString().replace(",", "."));
        if (isNaN(numberInput) || input === "") {
          numberInput = null;
        }

        if (this.context.inputMode !== FieldMode.chip) {
          this.context.onChangeInput(this.props.field, numberInput);
        } else {
          this.setState({ modalValue: numberInput });
        }

        break;
      default:
        if (this.context.inputMode !== FieldMode.chip) {
          this.context.onChangeInput(this.props.field, localInput);
        } else {
          this.setState({ modalValue: localInput });
        }
        break;
    }
  };

  onHide = (canceled: boolean) => {
    if (this.context.onHideInput) {
      this.context.onHideInput(
        this.state.modalValue,
        this.props.valueKey,
        canceled
      );
    }
    this.setState({ modalValue: "" });
  };

  onChipPress = () => {
    this.setState({ showModal: true });
  };

  render() {
    const mode = this.props.inputMode || FieldMode.horizontal;
    let isMandatory = this.props.field.column?.mandatory == true;
    let disabled =
      this.props.tabUIPattern == UI_PATTERNS.RO || this.props.field.readOnly;

    if (mode === FieldMode.horizontal) {
      return (
        <View style={{ paddingBottom: 10 }}>
          <Text allowFontScaling={false} style={componentsStyle.inputLabel}>
            {this.props.field.name} {isMandatory ? "(*)" : ""}
          </Text>
          <TextInput
            testID="input-text-box"
            key={`input-${this.props.field.id}`}
            ref={input => (this.inputRef = input)}
            style={componentsStyle.inputText}
            mode="outlined"
            dense
            editable={!disabled}
            onBlur={() =>
              !this.props.onBlur ? this.onBlur() : this.props.onBlur
            }
            onChangeText={input => {
              this.setState({ modalValue: input });
              this.onBlur(input);
            }}
            value={this.state.modalValue?.toString()}
            keyboardType={this.props.keyboardType}
            paddingRight={12}
            paddingLeft={12}
            qtyReturnKeyType={SCAN_QTY_KEY_TYPE}
            returnKeyType={this.props.qtyReturnKeyType || "done"}
          />
        </View>
      );
    } else {
      const { field, keyboardType } = this.props;
      return (
        <View>
          <Chip
            key={field.id}
            style={{ marginRight: 8 }}
            mode="outlined"
            icon="chevron-down"
            onPress={this.onChipPress}
          >
            {field.name} {isMandatory ? "(*)" : ""}
          </Chip>
          <Modal visible={!!this.state.showModal} transparent>
            <Dialog
              visible={!!this.state.showModal}
              onDismiss={() => {
                this.setState({ showModal: false });
                this.onHide(true);
              }}
            >
              <Dialog.Title allowFontScaling={false}>
                {locale.t("Reference:SelectName", { name: field.name })}
              </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  allowFontScaling={false}
                  ref={input => (this.inputRef = input)}
                  style={componentsStyle.inputText}
                  onBlur={this.onBlur}
                  onChangeText={input => {
                    this.setState({ modalValue: input });
                  }}
                  {...this.props}
                  value={this.state.modalValue?.toString()}
                  keyboardType={keyboardType}
                  qtyReturnKeyType={SCAN_QTY_KEY_TYPE}
                  returnKeyType={this.props.qtyReturnKeyType || "done"}
                  editable={!disabled}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  onPress={() => {
                    this.onHide(false);
                    this.setState({ showModal: false });
                  }}
                >
                  {locale.t("Done")}
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Modal>
        </View>
      );
    }
  }
}
