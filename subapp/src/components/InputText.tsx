import React from "react";
import { StyleSheet, TextInput } from "react-native";

interface Props {
  value: any;
  pref: any;
  placeholder: any;
  textContentType: any;
  secureTextEntry: any;
  onChangeText: any;
  onSubmitEditing: any;
  keyboardType: any;
  autoFocus: any;
}

interface State {}

export default class InputText extends React.Component<Props, State> {
  render() {
    return (
      <TextInput
        allowFontScaling={false}
        onChangeText={this.props.onChangeText}
        value={this.props.value}
        ref={this.props.pref}
        onSubmitEditing={this.props.onSubmitEditing}
        placeholder={this.props.placeholder}
        textContentType={this.props.textContentType}
        secureTextEntry={this.props.secureTextEntry}
        keyboardType={this.props.keyboardType}
        autoFocus={this.props.autoFocus}
      />
    );
  }
}
