import React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";
import { defaultTheme } from "../themes";

interface Props {
  title: string;
  sm?: string;
  md?: string;
  left?: string;
  right?: string;
  disabled?: true;
  onPress: any;
  style: any;
  uppercase: boolean;
}

interface State {}

export default class Button extends React.Component<Props, State> {
  render() {
    const { onPress, title } = this.props;
    const size = this.props.sm
      ? { paddingVertical: 8 }
      : this.props.md
      ? { paddingVertical: 10 }
      : { paddingVertical: 12 };
    const textAlign = this.props.left
      ? "left"
      : this.props.right
      ? "right"
      : "center";
    return (
      <TouchableHighlight
        disabled={this.props.disabled}
        underlayColor="#121865"
        style={{
          ...styles.button,
          ...this.props.style,
          ...size,
          backgroundColor: this.props.disabled ? "#b7b8c2" : "#242B84"
        }}
        onPress={onPress}
      >
        <Text
          allowFontScaling={false}
          style={{ ...styles.buttonText, textAlign }}
        >
          {this.props.uppercase ? title.toUpperCase() : title}
        </Text>
      </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    borderRadius: 5,
    paddingHorizontal: 8,
    elevation: 3
  },
  buttonText: {
    color: defaultTheme.colors.text,
    fontSize: 18,
    fontFamily: "poppins"
  }
});
