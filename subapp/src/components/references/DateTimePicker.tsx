import React from "react";
import Modal, { ModalProps, ModalState } from "./Modal";
import RNDateTimePicker, { Event } from "@react-native-community/datetimepicker";
import locale from "../../i18n/locale";
import FormContext from "../../contexts/FormContext";
import { Platform, View } from "react-native";
import { References } from "../../constants/References";

// Define the mode types for the DateTimePicker
export type modeType = "date" | "time"; 

export interface DateTimePickerProps extends ModalProps {
  dateMode?: modeType;
  referenceKey?: string;
  valueKey?: string;
  field: any;
  onChangeDateTime?: (field: any, date: string, valueKey?: string) => void;
}

interface State extends ModalState {
  currentDateTime: Date | null;
  currentDate: Date | null;
}

export default class DateTimePicker extends Modal<DateTimePickerProps, State> {
  static contextType = FormContext;

  constructor(props: DateTimePickerProps) {
    super(props);

    const now = new Date();
    let initialStateDate: Date | null = null;

    // Parse date from props.value if available
    if (props.value) {
      const dateParts = props.value.split("-");
      
      const year =  parseInt(dateParts[0])
      const month =  parseInt(dateParts[1]) - 1
      let day = parseInt(dateParts[2]);
      
      // Add a day specifically for iOS
      if (Platform.OS === 'ios') {
        day += 1;
      }
      
      initialStateDate = new Date(
        Date.UTC(
          year,
          month,
          day
        )
      );
    }

    const initialState: State = {
      currentDate: initialStateDate,
      showPickerModal: false,
      loading: false,
      currentDateTime: null
    };

    // Handle specific logic for "time" mode
    if (props.dateMode === "time" && props.value) {
      const strNow = locale.formatDate(now, locale.getUIDateFormat("Date"));
      initialState.currentDateTime = locale.parseISODate(strNow + " " + props.value);
    }

    this.state = initialState;
  }

  // Returns the current value based on the dateMode
  getValue = (): string | Date | null => {
    const value = this.props.dateMode === "time" ? this.state.currentDateTime : this.state.currentDate;

    if (value instanceof Date) {
      return new Date(
        Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
      )
        .toISOString()
        .split("T")[0];
    }

    return value;
  };

  // Format date for output
  formatForOutput = (date: Date) => {
    return locale.formatDate(date, locale.getServerDateFormat(this.props.referenceKey));
  };

  // Render the date or default label if date is absent
  renderLabel = () => {
    const value = this.getValue();
    return value ? this.renderDate(value as Date) : locale.t("Reference:Select");
  };

  // Utility function to format and render a date
  renderDate = (date: Date) => {
    return locale.formatDate(date, locale.getUIDateFormat(this.props.referenceKey));
  };

  // Handle showing of the DateTimePicker
  onShow = () => {
    if (!this.props.value) {
      const newState = this.props.dateMode === "time" ? { currentDateTime: new Date() } : { currentDate: new Date() };
      this.setState(newState);
    }
  };

  // Handle hiding of the DateTimePicker
  onHide = (canceled?: boolean) => {
    if (canceled) return;

    const currentDate = this.getValue();
    const outputDate = typeof currentDate === 'string' ? new Date(currentDate) : currentDate || new Date();
    this.context.onChangeDateTime(this.props.field, this.formatForOutput(outputDate), this.props.valueKey);
  };

  // Handle change of date/time in the DateTimePicker
  onChange = (event: Event, date?: Date): void => {
    if (Platform.OS === "ios") {
      this.setState({ currentDate: date || new Date() });
    } else {
      if (event && event.type === "set") {
        this.setState(
          { currentDate: date || new Date(), showPickerModal: false },
          this.onHide
        );
      } else {
        this.setState({ showPickerModal: false }, () => this.onHide(true));
      }
    }
  };

  // Render the content of the DateTimePicker
  renderDialogContent = () => {
    return (
      <View>
        {this.state.showPickerModal && (
          <RNDateTimePicker
            key={this.props.field.id}
            is24Hour // Android only
            mode={this.props.dateMode}
            onChange={this.onChange}
            display="spinner"
            value={this.state.currentDate || new Date()}
          />
        )}
        {this.state.showPickerModal && this.props.referenceKey === References.DateTime && (
          <RNDateTimePicker
            key={`tp-${this.props.field.id}`}
            is24Hour // Android only
            mode="time"
            onChange={this.onChange}
            display="spinner"
            value={this.getValue() ? locale.parseISODate(this.getValue() as string) : new Date()}
          />
        )}
      </View>
    );
  };
}
