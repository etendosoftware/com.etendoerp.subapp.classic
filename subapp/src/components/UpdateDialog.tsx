import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import locale from "../i18n/locale";
import { defaultTheme } from "../themes";

interface Props {
  onConfirm: any;
  visible: boolean;
  appMinCoreVersion: string;
  coreVersion: string;
}

interface State {}

export default class UpdateDialog extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  onConfirm = option => {
    if (this.props.onConfirm) {
      this.props.onConfirm(option);
    }
  };

  render() {
    return (
      <Portal>
        <Dialog
          visible={this.props.visible}
          style={{ backgroundColor: defaultTheme.colors.primary }}
        >
          <Dialog.Title>{locale.t("UpdateDialog:Title")}</Dialog.Title>
          <Dialog.Content>
            <Text allowFontScaling={false}>
              {locale.t("UpdateDialog:Text", {
                appMinCoreVersion: this.props.appMinCoreVersion,
                coreVersion: this.props.coreVersion
              })}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => this.onConfirm("logout")}>
              {locale.t("Log out")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
}
