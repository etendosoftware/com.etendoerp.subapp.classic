import React from "react";
import DateTimePicker, {
  DateTimePickerProps
} from "./references/DateTimePicker";
import Selector, { SelectorProps } from "./references/Selector";
import List, { ListProps } from "./references/List";
import Switch, { SwitchProps } from "./references/Switch";
import Attribute, { AttributeProps } from "./references/Attribute";
import { InputField, InputFieldProps } from "./InputField";
import { FieldProps, IField } from "./Field";
import { StyleProp, ViewStyle } from "react-native";
import FormContext from "../contexts/FormContext";
import { withTheme } from "react-native-paper";
import { References } from "../constants/References";

export type ReferenceProps = InputFieldProps &
  FieldProps &
  SelectorProps &
  SwitchProps &
  ListProps &
  DateTimePickerProps &
  AttributeProps;

interface State {}

class Reference extends React.Component<ReferenceProps, State> {
  static contextType = FormContext;

  ref: { focus: any };

  constructor(props: ReferenceProps) {
    super(props);
    this.state = {};
    this.ref = null;
  }

  focus = () => {
    if (this.ref && this.ref.focus) {
      this.ref.focus();
    }
  };

  render() {
    switch (this.props.referenceKey) {
      case References.Search:
      case References.Table:
      case References.TableDir:
      case References.TreeReference:
      case References.OBUISEL_SelectorReference:
        return <Selector key={this.props.field.id} {...this.props} />;
      case References.YesNo:
        return <Switch key={this.props.field.id} {...this.props} />;
      case References.List:
        return <List key={this.props.field.id} {...this.props} />;
      case References.Date:
      case References.DateTime:
        return (
          <DateTimePicker
            key={this.props.field.id}
            dateMode="date"
            {...this.props}
          />
        );
      case References.Time:
      case References.AbsoluteTime:
        return (
          <DateTimePicker
            key={this.props.field.id}
            dateMode="time"
            {...this.props}
          />
        );
      case References.Integer:
        return (
          <InputField
            ref={inp => (this.ref = inp)}
            key={this.props.field.id}
            keyboardType="number-pad"
            field={this.props.field}
            value={this.props.value}
            {...this.props}
          />
        );
      case References.Quantity:
      case References.Number:
      case References.Price:
      case References.GeneralQuantity:
      case References.Amount:
        return (
          <InputField
            ref={inp => (this.ref = inp)}
            key={this.props.field.id}
            keyboardType="decimal-pad"
            {...this.props}
          />
        );
      case References.String:
        return (
          <InputField
            ref={inp => (this.ref = inp)}
            key={this.props.field.id}
            keyboardType="default"
            field={this.props.field}
            value={this.props.value}
            {...this.props}
          />
        );
      case References.Text:
        return (
          <InputField
            ref={inp => (this.ref = inp)}
            key={this.props.field.id}
            keyboardType="default"
            multiline={true}
            blurOnSubmit={false}
            {...this.props}
          />
        );
      case References.PAttribute:
        return <Attribute key={this.props.field.id} {...this.props} />;
      case References.Button:
        // Do not render buttons as they will be used in FABs and Menu actions
        return null;
      default:
        return (
          <InputField
            ref={inp => (this.ref = inp)}
            key={this.props.field.id}
            keyboardType="default"
            forceDisabled
            {...this.props}
          />
        );
    }
  }
}

export default withTheme(Reference);
