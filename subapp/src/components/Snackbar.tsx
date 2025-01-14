import React from "react";
import { StyleSheet } from "react-native";
import {
  Snackbar as PaperSnackbar,
  Colors,
  withTheme
} from "react-native-paper";
import locale from "../i18n/locale";
import { Theme } from "react-native-paper/lib/typescript/types";
import { defaultTheme, ITheme } from "../themes";

interface Props extends ITheme {
  color: string;
  actionColor: string;
  errorColor: string;
  errorActionColor: string;
  theme: Theme;
  onDismiss: any;
  width: string;
  marginBottom: number;
  action: string;
}

interface State {
  show: boolean;
  message: string;
  isError: boolean;
  duration: any;
}

class Snackbar extends React.Component<Props, State> {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      message: "",
      isError: false,
      // @ts-ignore
      duration: PaperSnackbar.SHORT_DURATION
    };
  }

  get color() {
    return this.props.color || defaultTheme.colors.onSurface || Colors.black;
  }

  get actionColor() {
    return this.props.actionColor || defaultTheme.colors.accent || Colors.white;
  }

  get errorColor() {
    return this.props.errorColor || defaultTheme.colors.error || Colors.red500;
  }

  get errorActionColor() {
    return (
      this.props.errorActionColor || defaultTheme.colors.text || Colors.black
    );
  }

  // @ts-ignore
  show = (
    message,
    isError = false,
    duration = PaperSnackbar.SHORT_DURATION
  ) => {
    this.setState({ show: true, message, isError, duration });
  };

  hide = () => {
    this.setState({ show: false });
  };

  onDismiss = () => {
    this.setState({ show: false }, () => {
      if (this.props.onDismiss) {
        this.props.onDismiss();
      }
    });
  };

  render() {
    const { show, message, isError, duration } = this.state;
    return (
      // @ts-ignore
      <PaperSnackbar
        style={styles.snackbarStyle}
        visible={show}
        onDismiss={this.onDismiss}
        action={
          this.props.action
            ? this.props.action
            : {
                label: locale.t("DismissSnackBar"),
                onPress: () => {
                  this.setState({ show: false });
                }
              }
        }
        duration={duration}
        theme={{
          colors: {
            onSurface: isError ? this.errorColor : this.color,
            accent: isError ? this.errorActionColor : this.actionColor
          }
        }}
      >
        {message}
      </PaperSnackbar>
    );
  }
}

export default withTheme(Snackbar);

const styles = StyleSheet.create({
  snackbarStyle: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 30
  }
});
