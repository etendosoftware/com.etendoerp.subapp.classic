import React, { useContext } from "react";
import { View, Image, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { logout, User, Windows } from "../../stores";
import locale from "../../i18n/locale";
import {
  TextInput,
  Button,
  Appbar,
  Dialog,
  Text,
  Divider,
  List
} from "react-native-paper";
import { Snackbar } from "../../globals";
import { UpdateDialog } from "../../components";
import { Version } from "../../ob-api/objects";
import { INavigation } from "../../components/Card";
import MainAppContext from "../../contexts/MainAppContext";
import Languages from "../../ob-api/objects/Languages";
import { getUrl, setUrl, formatUrl } from "../../ob-api/ob";
import { defaultTheme } from "../../themes";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import imgLogo from "../../img/etendo-logo-1.png";
import imgLoginEtendo from "../../img/login-etendo.png";
import { CardViewStackNavigator } from "../../navigation/CardViewNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const logoUri = "utility/ShowImageLogo?logo=yourcompanylogin";
const MIN_CORE_VERSION = "3.0.202201";

interface Props {
  navigation: INavigation;
}

export interface EtendoLanguage {
  _entityName: string;
  active: string;
  client: string;
  createdBy: string;
  creationDate: string;
  id: string;
  language: string;
  name: string;
  organization: string;
  updated: string;
  updatedBy: string;
}

interface State {
  username: string;
  password: string;
  url: string;
  error: string;
  coreVersion: string;
  showUpdateDialog: boolean;
  showSetUrl: boolean;
  showPassword: boolean;
  storedDataUrl: any;
  showAddUrl: boolean;
  currentAddUrl: string;
  showChangePassword: boolean;
}

@observer
class LoginObj extends React.Component<Props, State> {
  static contextType = MainAppContext;

  secondTextInput: any;
  props: any;
  context: any;

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: "",
      coreVersion: "",
      showUpdateDialog: false,
      url: "",
      showPassword: false,
      showSetUrl: false,
      showAddUrl: false,
      currentAddUrl: "",
      storedDataUrl: [],
      showChangePassword: false
    };
    this.props = props;
    this.context = props.context;
  }

  loadWindows = async token => {
    const {updateLanguageList} = this.context;
    updateLanguageList();
    if (!Windows.hydrated || !token) {
      //Build the menu items for the initial app configuration
      const menus = Windows.menuItems.map(m => {
        return {
          name: m.label,
          component: CardViewStackNavigator,
          windowId: m.windowId,
          tabLevel: 0,
          tabs: Windows.getTabs(m.windowId),
          app: "EtendoApp",
          route: "CardView1"
        };
      });
      Etendo.addMenuItem(menus);
      return menus;
    }
  };

  resetState = () => {
    this.setState({
      username: "",
      password: "",
      error: "",
      coreVersion: "",
      showUpdateDialog: false,
      showPassword: false,
      showAddUrl: false,
      currentAddUrl: "",
      storedDataUrl: []
    });
  };

  submitLogin = async () => {
    const { username, password } = this.state;
    try {
      User.loading = true;
      Windows.loading = true;
      try {
        await User.login(username, password);
        const isCoreVersionBeingChecked = await this.checkCoreCompatibility();
        if (!isCoreVersionBeingChecked) {
          await this.loadWindows(false);
        }
      } catch (e) {
        console.error("submitLogin::catch", e);
        await User.logout();
        if (e.message.includes("Request failed with status code 404")) {
          Snackbar.showError(locale.t("LoginScreen:URLNotFound"));
        } else if (e.message.includes("Network Error")) {
          Snackbar.showError(locale.t("LoginScreen:NetworkError"));
        } else {
          Snackbar.showError(e.message);
        }
      }
    } catch (e) {
      Snackbar.showError(e.message);
      console.log(e);
    } finally {
      User.loading = false;
      Windows.loading = false;
    }
  };

  onConfirmVersionUpdate = option => {
    if (option === "logout") logout();
    this.setState({ showUpdateDialog: false });
  };

  checkCoreCompatibility = async () => {
    const coreVersion = (await Version.getVersion()).data[0].coreVersion;
    const shouldShowUpdateDialog =
      this.versionCompare(MIN_CORE_VERSION, coreVersion) > 0;
    this.setState({ coreVersion });
    this.setState({ showUpdateDialog: shouldShowUpdateDialog });
    return shouldShowUpdateDialog;
  };

  versionCompare(v1, v2, options?) {
    var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split("."),
      v2parts = v2.split(".");
    function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }
    if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push("0");
      while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
        return 1;
      }
      if (v1parts[i] == v2parts[i]) {
        continue;
      } else if (v1parts[i] > v2parts[i]) {
        return 1;
      } else {
        return -1;
      }
    }
    if (v1parts.length != v2parts.length) {
      return -1;
    }
    return 0;
  }

  saveUrl = async () => {
    if (!this.state.url || this.state.url == "") return;
    await setUrl(this.state.url);
    await User.saveEnviromentsUrl(this.state.storedDataUrl);
    this.setState({ showSetUrl: false });
  };

  addUrl = async () => {
    let currentValue = this.state.currentAddUrl;
    if (!currentValue || currentValue == "") return;
    currentValue = formatUrl(currentValue);
    this.setState({
      storedDataUrl: [...this.state.storedDataUrl, currentValue],
      currentAddUrl: ""
    });
  };

  demo = async () => {
    await setUrl("http://10.0.2.2:8080/etendo");
    this.setState({ username: "admin", password: "admin" });
    this.submitLogin();
    Etendo.closeDrawer();
    this.setState({ showSetUrl: false });
  };

  renderUrlItems = items => {
    if (items.length !== 0) {
      return items.map(item => {
        return (
          <>
            <List.Item
              key={item}
              titleNumberOfLines={1}
              titleEllipsizeMode="tail"
              title={item}
              right={() => (
                <TouchableOpacity
                  onPress={() => {
                    let filteredItems = this.state.storedDataUrl.filter(
                      url => url !== item
                    );
                    this.setState({ storedDataUrl: filteredItems });
                  }}
                >
                  <Icon
                    name="delete-empty"
                    size={25}
                    color={defaultTheme.colors.primary}
                  />
                </TouchableOpacity>
              )}
            />
          </>
        );
      });
    } else {
      return (
        <Text
          allowFontScaling={false}
          style={{
            color: defaultTheme.colors.textSecondary,
            fontSize: 15,
            textAlign: "center",
            textAlignVertical: "center",
            height: 150
          }}
        >
          {locale.t("ShowLoadUrl:NotItemList")}
        </Text>
      );
    }
  };

  renderPickerItems = items => {
    return items.map(item => {
      return <Picker.Item key={item} label={item} value={item} />;
    });
  };

  ChangedPassword = () => {
    return (
      <Dialog
        visible={this.state.showChangePassword}
        style={{ height: "25%", justifyContent: "center" }}
      >
        <Dialog.Content>
          <Text allowFontScaling={false}>{locale.t("Recover_password")}</Text>
        </Dialog.Content>
        <View style={{ width: "100%", alignSelf: "center" }}>
          <TouchableOpacity
            onPress={() => this.setState({ showChangePassword: false })}
            style={{
              backgroundColor: defaultTheme.colors.accent,
              width: "20%",
              alignSelf: "flex-end",
              marginRight: 20
            }}
          >
            <Button style={{ width: "100%", alignItems: "center" }}>Ok</Button>
          </TouchableOpacity>
        </View>
      </Dialog>
    );
  };

  render() {
    return (
      <View style={styles.generalView}>
        <View style={styles.viewStyle}>
          <View style={styles.appbarStyle}>
            <Appbar.Action
              icon="cog"
              onPress={() => this.props.navigation.navigate("Settings")}
            />
          </View>
          <View style={styles.containerLogo}>
            <Image
              style={styles.logo}
              resizeMode={"contain"}
              source={{ uri: imgLogo }}
            />
          </View>
          <View style={styles.containerInputs}>
            <Button style={styles.buttonDemo} onPress={() => this.demo()}>
              {locale.t("DemoTry")}
            </Button>
            <TextInput
              allowFontScaling={false}
              style={styles.textInputStyle}
              mode="outlined"
              label={locale.t("User")}
              value={this.state.username}
              onChangeText={username => this.setState({ username })}
              textContentType="username"
              onSubmitEditing={() => this.secondTextInput.focus()}
            />
            <TextInput
              allowFontScaling={false}
              style={styles.textInputStyle}
              mode="outlined"
              label={locale.t("Password")}
              textContentType="password"
              value={this.state.password}
              onChangeText={password => this.setState({ password })}
              ref={input => {
                this.secondTextInput = input;
              }}
              onSubmitEditing={this.submitLogin}
              secureTextEntry={!this.state.showPassword}
              right={
                <TextInput.Icon
                  style={styles.textInputIconStyle}
                  name={this.state.showPassword ? "eye-off" : "eye"}
                  color={
                    this.state.showPassword
                      ? defaultTheme.colors.primary
                      : defaultTheme.colors.disabled
                  }
                  onPress={() => {
                    this.setState({ showPassword: !this.state.showPassword });
                  }}
                  forceTextInputFocus={false}
                />
              }
            />
          </View>
          <View style={styles.containerLogin}>
            <Button
              style={styles.buttonLogin}
              mode="contained"
              loading={User.loading || Windows.loading}
              disabled={User.loading || Windows.loading}
              onPress={this.submitLogin}
            >
              <Text
                style={{ fontSize: 15, color: defaultTheme.colors.background }}
                allowFontScaling={false}
              >
                {locale.t("Log in")}
              </Text>
            </Button>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => [this.setState({ showChangePassword: true })]}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 13,
                  textAlign: "right",
                  marginTop: 5,
                  color: defaultTheme.colors.textSecondary,
                  marginRight: 3
                }}
              >
                {locale.t("Forgot_password")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.containerImage}>
            <Image
              source={{ uri: imgLoginEtendo }}
              style={styles.image}
              resizeMode={"cover"}
            />
          </View>
          <View style={styles.containerCopyright}>
            <Text allowFontScaling={false} style={styles.copyrightStyle}>
              @ Copyright Etendo 2020-2021
            </Text>
          </View>
        </View>
        {this.ChangedPassword()}

        {/* Pop up that appears when you first log in */}
        <UpdateDialog
          visible={this.state.showUpdateDialog}
          coreVersion={this.state.coreVersion}
          appMinCoreVersion={MIN_CORE_VERSION}
          onConfirm={this.onConfirmVersionUpdate}
        ></UpdateDialog>

        <Dialog visible={this.state.showSetUrl}>
          <Dialog.Title>
            <Text allowFontScaling={false}>
              {locale.t("ShowLoadUrl:Title")}
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text allowFontScaling={false}>
              {locale.t("ShowLoadUrl:Content")}
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: defaultTheme.colors.primary,
                borderRadius: 4
              }}
            >
              <Picker
                selectedValue={this.state.url}
                onValueChange={url => this.setState({ url })}
                style={[styles.picker]}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item
                  key="disabled"
                  label={locale.t("ShowLoadUrl:PickerLabel")}
                  value=""
                />
                {this.renderPickerItems(this.state.storedDataUrl)}
              </Picker>
            </View>
          </Dialog.Content>

          <Dialog.Actions style={{ marginRight: 20 }}>
            <Button
              style={{
                width: 110,
                backgroundColor: defaultTheme.colors.accent,
                marginRight: 10
              }}
              onPress={() => this.setState({ showAddUrl: true })}
            >
              {" "}
              {locale.t("ShowLoadUrl:Add")}
            </Button>
            <Button
              style={{
                width: 110,
                backgroundColor: defaultTheme.colors.backgroundSecondary
              }}
              onPress={() => this.saveUrl()}
            >
              {" "}
              {locale.t("Save")}
            </Button>
          </Dialog.Actions>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              alignItems: "center"
            }}
          >
            <Divider style={{ padding: 1, flexGrow: 1 }} />
            <Text
              allowFontScaling={false}
              style={{ textAlignVertical: "center", margin: 20 }}
            >
              {locale.t("Or")}
            </Text>
            <Divider style={{ padding: 1, flexGrow: 1 }} />
          </View>
          <Dialog.Title>
            <Text allowFontScaling={false}>
              {locale.t("ShowLoadUrl:DemoTitle")}
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text>{locale.t("ShowLoadUrl:Demo")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              style={{
                width: 150,
                backgroundColor: defaultTheme.colors.backgroundSecondary,
                margin: 10
              }}
              onPress={() => this.demo()}
            >
              {locale.t("DemoTry")}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={this.state.showAddUrl}>
          <Dialog.Title>
            <Text allowFontScaling={false}>
              {locale.t("ShowLoadUrl:AddUrl")}
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              allowFontScaling={false}
              mode="outlined"
              placeholder={locale.t("ShowLoadUrl:Example")}
              value={this.state.currentAddUrl}
              onChangeText={currentAddUrl => this.setState({ currentAddUrl })}
              textContentType="URL"
              label={locale.t("ShowLoadUrl:EnvironmentUrl")}
            />
            <Dialog.Actions style={{ marginTop: 20 }}>
              <Button
                style={{
                  backgroundColor: defaultTheme.colors.accent,
                  width: 120,
                  marginRight: 10
                }}
                onPress={() => this.addUrl()}
              >
                {locale.t("ShowLoadUrl:Add")}
              </Button>
              <Button
                style={{
                  width: 120,
                  backgroundColor: defaultTheme.colors.backgroundSecondary
                }}
                onPress={() => this.setState({ showAddUrl: false })}
              >
                {locale.t("ShowLoadUrl:Close")}
              </Button>
            </Dialog.Actions>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10
              }}
            >
              <Divider style={{ padding: 1, flexGrow: 1 }} />
              <Text
                allowFontScaling={false}
                style={{
                  textAlignVertical: "center",
                  margin: 10,
                  fontSize: 15
                }}
              >
                {locale.t("ShowLoadUrl:ItemList")}
              </Text>
              <Divider style={{ padding: 1, flexGrow: 1 }} />
            </View>
            <View style={{ height: 200 }}>
              <ScrollView>
                {this.renderUrlItems(this.state.storedDataUrl)}
              </ScrollView>
            </View>
          </Dialog.Content>
        </Dialog>
      </View>
    );
  }
}

export const Login = (props: any) => {
  const navigate = useNavigation();
  const context = useContext(MainAppContext);
  return (
    <PaperProvider theme={defaultTheme}>
      <LoginObj {...props} navigate={navigate} context={context} />
    </PaperProvider>
  );
};
export default Login;

const styles = StyleSheet.create({
  generalView: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: 16,
    backgroundColor: defaultTheme.colors.background
  },
  viewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: defaultTheme.colors.background,
    height: "100%"
  },
  appbarStyle: {
    paddingTop: 28,
    paddingLeft: 8
  },
  containerLogo: {
    height: "15%"
  },
  logo: {
    height: 50
  },
  containerInputs: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    paddingHorizontal: 16,
    marginBottom: 0
  },
  buttonDemo: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  textInputStyle: {
    justifyContent: "center",
    height: 45,
    paddingVertical: 5,
    marginBottom: 0,
    marginTop: 10,
    fontSize: 15
  },
  textInputIconStyle: {
    paddingTop: 10
  },
  containerLogin: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16
  },
  buttonLogin: {
    height: 45,
    paddingVertical: 5,
    fontSize: 1
  },
  containerImage: {
    height: "30%"
  },
  image: {
    height: 50
  },
  containerCopyright: {
    alignSelf: "flex-end"
  },
  copyrightStyle: {
    width: 1000,
    textAlign: "center",
    color: defaultTheme.colors.primary,
    //fontFamily: "poppins-medium",
    fontSize: 12,
    backgroundColor: defaultTheme.colors.background
  },
  picker: {
    height: 44,
    borderColor: defaultTheme.colors.primary,
    borderWidth: 1
  },
  pickerItem: {
    height: 44
  }
});
