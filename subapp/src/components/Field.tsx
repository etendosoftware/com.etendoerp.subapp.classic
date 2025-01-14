import React, { ReactNode } from "react";
import { Chip, Subheading } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { Field as FieldType } from "../types";
import { defaultTheme } from "../themes";
import { References } from "../constants/References";

export type IField = FieldType;

export enum FieldMode {
  horizontal,
  chip
}

export interface FieldProps {
  mode?: FieldMode;
  fieldStyle?: any;
  renderField?: any;
  field: IField;
  // Following props are for mode: FieldMode.chip
  onChipSelected?: (fieldId: string) => void;
  onChipClosed?: (fieldId: string) => void;
  selected?: boolean;
  tabUIPattern?: string;
}

export interface FieldState {}

export default abstract class Field<
  P extends FieldProps,
  S extends FieldState
> extends React.Component<P, S> {
  abstract renderField(): ReactNode;

  abstract onChipSelected(fieldId: string): void;

  onChipPress = () => {
    this.onChipSelected(this.props.field.id);
  };

  render() {
    const mode = this.props.mode || FieldMode.horizontal;
    let isMandatory = this.props.field.column?.mandatory == true;

    let referenceKey = null;
    if (this.props.field.column) {
      referenceKey = this.props.field.column.reference;
    }

    let isSwitch = false;
    if (referenceKey == References.YesNo) {
      isSwitch = true;
    }

    switch (mode) {
      case FieldMode.horizontal:
        return (
          <View
            key={`v-${this.props.field.id}`}
            style={{
              flexDirection: "column",
              marginBottom: 8,
              ...this.props.fieldStyle
            }}
          >
            <Subheading style={styles.subheadingStyle}>
              {this.props.field.name + ": "}
              {isMandatory && !isSwitch ? "(*)" : ""}
            </Subheading>
            <View style={styles.switchStyle}>{this.renderField()}</View>
          </View>
        );
      case FieldMode.chip:
        const { selected, field, onChipClosed } = this.props;
        return (
          <View>
            <Chip
              key={field.id}
              style={styles.chipStyle}
              mode="outlined"
              icon="chevron-down"
              onPress={this.onChipPress}
              onClose={selected ? () => onChipClosed(field.id) : null}
              selected={selected}
            >
              {field.name} {isMandatory && !isSwitch ? "(*)" : ""}
            </Chip>
            {this.renderField()}
          </View>
        );
      default:
        return null;
    }
  }
}

const styles = StyleSheet.create({
  subheadingStyle: {
    width: "100%",
    color: defaultTheme.colors.text
  },
  switchStyle: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  chipStyle: {
    marginRight: 8
  }
});
