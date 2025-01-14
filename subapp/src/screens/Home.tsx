//React imports
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  Text,
  Platform
} from "react-native";
//UI RNP
import { Appbar } from "react-native-paper";
//Translates
import locale from "../i18n/locale";
//observables
import { observer } from "mobx-react";
//Context
import MainAppContext from "../contexts/MainAppContext";
//Navigation
import { INavigation } from "../components/Card";
//Themes
import { defaultTheme } from "../themes";
//Hooks
import { isTablet } from "../../hooks/IsTablet";
//Images
import HomeImage from "../img/home2.png";
import EtendoLogo from "../img/etendo-logo-1.png";
import EtendoBoyBack from "../img/etendo_boy_back.png";

interface Props {
  navigation: INavigation;
  appMinCoreVersion: string;
  coreVersion: string;
}

interface State {}

const win = Dimensions.get("window");
const ratio = win.width / 1080; //541 is actual image width

@observer
class Home extends React.Component<Props, State> {
  static contextType = MainAppContext;
  render() {
    return (
      <View style={styles.container}>
        <Appbar.Header dark={true}>
          <Appbar.Action
            icon="menu"
            onPress={() => this.props.navigation.toggleDrawer()}
          />
          <Appbar.Content
            title={locale.t("Home:Title")}
            titleStyle={{ fontFamily: "Poppins-Medium" }}
          />
        </Appbar.Header>
        <View style={styles.conteinerSup}>
          <View
            style={{
              flex: 1,
              backgroundColor: defaultTheme.colors.accent
            }}
          >
            <Image
              style={styles.logo}
              resizeMode={"stretch"}
              source={{ uri: HomeImage }}
            />
          </View>
          <View style={styles.etendoContainer}>
            <Image style={styles.etendo} source={{ uri: EtendoLogo }} />
            <Text allowFontScaling={false} style={styles.text}>
              {locale.t("Welcome!")}
            </Text>
          </View>
          <View
            style={{
              width: "10%",
              backgroundColor: defaultTheme.colors.accent,
              height: "100%"
            }}
          />
        </View>
        <Image style={styles.image} source={{ uri: EtendoBoyBack }} />
      </View>
    );
  }
}

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultTheme.colors.background,
    height: "100%"
  },
  image: {
    height: 342,
    width: 364,
    right: 0,
    bottom: 0,
    position: "absolute"
  },
  logo: {
    height: "100%",
    width: 130
  },
  etendo: {
    height: 50,
    width: 200
  },
  etendoContainer: {
    height: "100%",
    width: isTablet() ? 260 : 220,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  text: {
    color: defaultTheme.colors.textSecondary,
    fontSize: 20,
    alignSelf: "flex-end",
    paddingRight: isTablet() ? 40 : 20
  },

  conteinerSup: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 80,
    alignItems: "center",
    marginTop: 20
  }
});
