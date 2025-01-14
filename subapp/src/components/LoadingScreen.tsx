import React from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { withTheme } from "react-native-paper";
import locale from "../i18n/locale";
import { defaultTheme, ITheme } from "../themes";

interface Props extends ITheme {
  visible: boolean;
}

interface State {
  visible: boolean;
}

class LoadingScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      visible: this.props.visible
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible !== prevProps.visible) {
      this.setState({ visible: this.props.visible });
    }
  }

  hideLoader = () => {
    if (process.env.NODE_ENV !== "production") {
      this.setState({ visible: false });
    }
  };
  render() {
    return (
      <Spinner
        color={defaultTheme.colors.accent}
        overlayColor={defaultTheme.colors.primary}
        textStyle={{ color: defaultTheme.colors.surface }}
        visible={this.state.visible}
        onPress={this.hideLoader}
        textContent={locale.t("LoadingScreen:loadingText")}
        //customIndicator={<ActivityIndicator size='large' />}
      />
    );
  }
}

export default withTheme(LoadingScreen);
