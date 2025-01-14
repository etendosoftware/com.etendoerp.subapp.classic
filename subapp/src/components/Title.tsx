import React from "react";
import { StyleSheet, Text } from "react-native";

interface Props {
  color: any;
  style: any;
  lg: boolean;
}

interface State {}

export default class Title extends React.Component<Props, State> {
  render() {
    const fontSize = this.props.lg ? 23 : 18;
    const color = this.props.color;
    const inheritedStyle = this.props.style;
    return (
      <Text style={{ ...styles.default, ...inheritedStyle, fontSize, color }}>
        {this.props.children}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  default: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: "poppins"
  }
});
