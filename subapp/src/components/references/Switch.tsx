import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import {
  Button,
  Dialog,
  RadioButton,
  Subheading,
  Switch as PaperSwitch,
  Text,
  withTheme
} from "react-native-paper";
import locale from "../../i18n/locale";
import { defaultTheme, ITheme } from "../../themes";
import Field, { FieldProps, FieldState, FieldMode } from "../Field";
import FormContext from "../../contexts/FormContext";
import { UI_PATTERNS } from "../../ob-api/constants/uiPatterns";

export interface SwitchProps extends FieldProps, ITheme {
  value?: string | boolean;
  valueKey?: string;
}

interface State extends FieldState {
  showModal: boolean;
  modalValue: boolean;
}

class Switch extends Field<SwitchProps, State> {
  static contextType = FormContext;

  constructor(props: SwitchProps) {
    super(props);
    this.state = {
      showModal: false,
      modalValue: (this.props.value as boolean) || false
    };
  }

  onChipSelected(_: string): void {
    this.setState({ showModal: true });
  }

  onHide = (canceled: boolean) => {
    if (this.context.onHideSwitchModal) {
      this.context.onHideSwitchModal(
        this.state.modalValue,
        this.props.valueKey,
        canceled
      );
    }
    this.setState({ modalValue: false });
  };

  renderField = () => {
    const mode = this.props.mode || FieldMode.horizontal;
    const disabled =
      this.props.field.readOnly || this.props.tabUIPattern == UI_PATTERNS.RO;

    if (mode === FieldMode.horizontal) {
      return (
        <View style={styles.paperswitchStyle}>
          <PaperSwitch
            key={`switch-${this.props.field.id}`}
            value={this.state.modalValue as boolean}
            disabled={disabled}
            color={defaultTheme.colors.primary}
            onValueChange={value => {
              this.setState({ modalValue: value });
              this.context.onChangeSwitch(this.props.field, value);
            }}
          />
        </View>
      );
    } else {
      return (
        <Modal visible={!!this.state.showModal} transparent>
          <Dialog
            visible={!!this.state.showModal}
            onDismiss={() => {
              this.setState({ showModal: false });
              this.onHide(true);
            }}
          >
            <Dialog.Title>
              {locale.t("Reference:SelectName", {
                name: this.props.field.name
              })}
            </Dialog.Title>
            <Dialog.Content
              style={{
                display: "flex",
                flexDirection: "column",
                alignContent: "space-between"
              }}
            >
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Subheading style={{ width: "35%" }}>
                  {locale.t("Yes")}
                </Subheading>
                <RadioButton
                  value="true"
                  status={this.state.modalValue ? "checked" : "unchecked"}
                  onPress={() => this.setState({ modalValue: true })}
                  color={this.props.theme.colors.primary}
                  uncheckedColor={this.props.theme.colors.accent}
                  disabled={disabled}
                />
              </View>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Subheading style={{ width: "35%" }}>
                  {locale.t("No")}
                </Subheading>
                <RadioButton
                  value="false"
                  status={this.state.modalValue ? "unchecked" : "checked"}
                  onPress={() => this.setState({ modalValue: false })}
                  color={this.props.theme.colors.primary}
                  uncheckedColor={this.props.theme.colors.accent}
                  disabled={disabled}
                />
              </View>
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
      );
    }
  };
}

export default withTheme(Switch);

const styles = StyleSheet.create({
  paperswitchStyle: {
    marginTop: -28,
    marginBottom: 10
  }
});
