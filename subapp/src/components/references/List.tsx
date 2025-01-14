import React from "react";
import { Picker } from "@react-native-picker/picker";
import Modal, { ModalProps, ModalState } from "./Modal";
import locale from "../../i18n/locale";
import FormContext from "../../contexts/FormContext";

export interface PickerItem {
  id: string;
  value: string;
  label: string;
}

export interface ListProps extends ModalProps {
  onChangePicker?: (value: string, key: string, diplayedValue?: string) => void;
  pickerItems?: PickerItem[];
  valueKey?: string;
  onChangeSelection?: (
    value: string,
    key: string,
    diplayedValue?: string
  ) => void;
  onChangeModalPicker?: any;
}

interface State extends ModalState {
  currentSelection: string;
}

export default class List extends Modal<ListProps, State> {
  static contextType = FormContext;

  constructor(props: ListProps) {
    super(props);
    this.state = {
      currentSelection:
        props.value ||
        (props.pickerItems &&
          props.pickerItems.length > 0 &&
          props.pickerItems[0].value),
      showPickerModal: false,
      loading: false
    };
  }

  onHide = () => {
    this.context.onChangePicker(
      this.props.field,
      this.state.currentSelection ||
        this.props.value ||
        this.props.pickerItems[0].value,
      this.props.valueKey,
      this.renderLabel()
    );
  };

  onValueChange = (itemValue: string) => {
    this.setState({ currentSelection: itemValue });
    if (this.context.onChangeSelection) {
      this.context.onChangeSelection(
        itemValue,
        this.props.valueKey,
        this.renderLabel()
      );
    }
  };

  renderLabel = () => {
    return (
      this.props.pickerItems.find(i => i.value === this.state.currentSelection)
        ?.label ||
      this.props.value ||
      locale.t("Reference:Select")
    );
  };

  renderPickerItems = (items: PickerItem[]) => {
    return items.map(item => {
      return (
        <Picker.Item key={item.id} label={item.label} value={item.value} />
      );
    });
  };

  renderDialogContent = () => {
    return (
      <Picker
        key={this.props.field.id}
        enabled={!this.props.field.readOnly}
        selectedValue={this.state.currentSelection}
        onValueChange={this.onValueChange}
      >
        {this.renderPickerItems(this.props.pickerItems)}
      </Picker>
    );
  };
}
