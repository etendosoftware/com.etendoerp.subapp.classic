import React from "react";
import PickerList from "../components/references/List";
import {
  View,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import locale from "../i18n/locale";
import {
  Appbar,
  List,
  withTheme,
  Button,
  Dialog,
  Portal,
  Text,
  Divider
} from "react-native-paper";
import { setUrl, getUrl, formatUrl } from "../ob-api/ob";
import { version } from "../../package.json";
import { User, logout } from "../stores";
import { observer } from "mobx-react";
import { Snackbar } from "../globals";
import Languages from "../ob-api/objects/Languages";
import MainAppContext from "../contexts/MainAppContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { INavigation } from "../components/Card";
import { defaultTheme, ITheme } from "../themes";
import FormContext from "../contexts/FormContext";
import { IField } from "../components/Field";
import SettingsProfile from "../img/settings-profile.png";
import LogoImage from "../../assets/logo.png";
import { Picker } from "@react-native-picker/picker";

const logoUri = "utility/ShowImageLogo?logo=yourcompanylogin";
const win = Dimensions.get("window");

interface Props extends ITheme {
  navigation: INavigation;
}

interface State {
  modalUrl: string;
  showChangeURLModal: boolean;
  url: string;
  logo: any;
  showLogoutConfirmation: boolean;
  defaultLogo: any;
  open: boolean;
  selectedLanguage: string;
  storedDataUrl: any;
  showAddUrl: boolean;
  currentAddUrl: string;
  appVersion: string;
}

@observer
class Settings extends React.Component<Props, State> {
  static contextType = MainAppContext;

  constructor(props) {
    super(props);

    this.state = {
      url: null,
      modalUrl: null,
      showChangeURLModal: false,
      showLogoutConfirmation: false,
      logo: null,
      defaultLogo: null,
      open: false,
      selectedLanguage: null,
      showAddUrl: false,
      currentAddUrl: "",
      storedDataUrl: [],
      appVersion: version
    };
  }

  componentDidMount = async () => {
    const url = await getUrl();
    const logo = this.loadServerLogo(url);
    const defaultLogo = require(LogoImage);
    const appVersion = await this.getAppVersion();

    let storedEnviromentsUrl = await User.loadEnviromentsUrl();

    if (storedEnviromentsUrl) {
      this.setState({ storedDataUrl: storedEnviromentsUrl });
    }

    this.setState({
      defaultLogo,
      logo,
      url,
      appVersion,
      modalUrl: url.toString() /* Without 'toString', variable is pass by reference */
    });
  };

  loadServerLogo = url => {
    let logo;
    if (url) {
      const logoUrl = url + logoUri;
      logo = logoUrl;
    } else {
      logo = require(LogoImage);
    }
    return logo;
  };

  showChangeURLModal = () => {
    if (User.token) {
      this.showLogoutConfirmation();
    } else {
      this.setState({ showChangeURLModal: true });
    }
  };

  hideChangeURLModal = () => {
    this.setState(prevState => {
      return { showChangeURLModal: false, modalUrl: prevState.url };
    });
  };

  changeURL = async () => {
    if (!this.state.modalUrl || this.state.modalUrl == "") return;
    await User.saveEnviromentsUrl(this.state.storedDataUrl);
    const url = await setUrl(this.state.modalUrl);
    const logo = this.loadServerLogo(url);
    this.setState({ showChangeURLModal: false, modalUrl: url, url, logo });
  };

  onChangeModalURL = modalUrl => {
    this.setState({ modalUrl });
  };

  changeURLButton = () => {
    return (
      <Button
        style={{
          backgroundColor: defaultTheme.colors.accent,
          height: 50,
          fontFamily: "Poppins-Medium"
        }}
        mode="text"
        onPress={this.showChangeURLModal}
      >
        {locale.t("Settings:ChangeURL")}
      </Button>
    );
  };

  showLogoutConfirmation = () => {
    this.setState({ showLogoutConfirmation: true });
  };

  hideLogoutConfirmation = () => {
    this.setState({ showLogoutConfirmation: false });
  };

  confirmLogout = () => {
    this.hideLogoutConfirmation();
    logout();
  };

  onLogoError = ({ nativeEvent }) => {
    Snackbar.showError(nativeEvent.error);
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  getServerLanguages = () => {
    return Languages.getLanguages();
  };

  onChangeModalPicker = async (field: IField, value: string) => {
    this.setState({ selectedLanguage: value ? value : field.toString() });
    const { changeLanguage } = this.context;
    changeLanguage(value ? value : field.toString());
  };

  onChangePicker = (item: string) => {
    this.setState({ selectedLanguage: item });
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
            height: 150,
            fontFamily: "Poppins-Medium"
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

  getAppVersion = async () => {
    const metadata = null; // = await codePush.getUpdateMetadata();

    if (!metadata) {
      return version;
    }

    return `${metadata.appVersion} - ${metadata.label}`;
  };

  render() {
    const {
      url,
      modalUrl,
      showChangeURLModal,
      showLogoutConfirmation,
      defaultLogo,
      logo,
      appVersion
    } = this.state;
    const { languages } = this.context;
    return (
      <View
        style={{ flex: 1, backgroundColor: defaultTheme.colors.background }}
      >
        <Appbar.Header dark={true}>
          {!User.token && (
            <Appbar.BackAction
              onPress={() => this.props.navigation.navigate("Login")}
            />
          )}
          {User.token && (
            <Appbar.Action icon="menu" onPress={() => Etendo.toggleDrawer()} />
          )}
          <Appbar.Content title={locale.t("Settings:Title")} />
        </Appbar.Header>
        <List.Section
          titleStyle={{ fontSize: 20, fontFamily: "Poppins-Medium" }}
          style={{ width: "90%", alignSelf: "center" }}
        >
          <List.Item
            title={locale.t("Settings:URL")}
            titleStyle={{ fontSize: 15, fontFamily: "Poppins-Medium" }}
            description={url}
            descriptionStyle={{ paddingTop: 16, fontFamily: "Poppins-Medium" }}
            descriptionNumberOfLines={1}
            style={{ marginTop: 10 }}
          />
          {!User.token ? (
            <>
              <Button
                style={{ width: 150, alignSelf: "flex-end", marginBottom: 15 }}
                mode="text"
                onPress={this.showChangeURLModal}
                labelStyle={{ fontFamily: "Poppins-Medium" }}
              >
                {locale.t("Settings:ChangeURL")}
              </Button>
            </>
          ) : (
            <Text
              allowFontScaling={false}
              style={{ marginLeft: 15, fontFamily: "Poppins-Medium" }}
            >
              {locale.t("Settings:ChangeURLLogoutConfirmation")}
            </Text>
          )}
          <List.Item
            title={locale.t("Settings:Logo")}
            style={{ marginTop: 10 }}
            titleStyle={{ fontSize: 15, fontFamily: "Poppins-Medium" }}
          />
          <Image
            resizeMode="contain"
            style={{ height: 80 }}
            defaultSource={defaultLogo}
            source={logo.replace(/(\r\n|\n|\r|\s)/gm, "")}
            onError={this.onLogoError}
          />
          <View style={{ marginTop: 10 }}>
            <FormContext.Provider
              value={{
                getRecordContext: this.context.getRecordContext,
                onChangePicker: this.onChangeModalPicker,
                onChangeSelection: this.onChangePicker
              }}
            >
              <PickerList
                pickerItems={languages}
                fieldStyle={{ padding: 16, fontFamily: "Poppins-Medium" }}
                field={{
                  id: "Language Field",
                  name: locale.t("Settings:Language"),
                  readOnly: false,
                  column: { updatable: true },
                  columnName: null
                }}
                value={
                  this.state.selectedLanguage
                    ? this.state.selectedLanguage
                    : this.context.selectedLanguage
                }
              ></PickerList>
            </FormContext.Provider>
          </View>
          <Text
            allowFontScaling={false}
            style={{
              paddingTop: 5,
              marginLeft: 35,
              marginBottom: 5,
              fontFamily: "Poppins-Medium"
            }}
          >
            {" "}
            {locale.t("Settings:AppVersion", { version: appVersion })}{" "}
          </Text>
        </List.Section>

        <Image
          style={styles.image}
          resizeMode={"cover"}
          source={SettingsProfile}
          height={win.height}
        />
        <Portal>
          <Dialog
            visible={showChangeURLModal}
            onDismiss={this.hideChangeURLModal}
          >
            <Dialog.Title>{locale.t("Settings:ChangeServerURL")}</Dialog.Title>
            <Dialog.Content>
              <Picker
                selectedValue={this.state.modalUrl}
                onValueChange={modalUrl => this.setState({ modalUrl })}
                itemStyle={{ paddingLeft: 15, marginLeft: 15 }}
              >
                <Picker.Item
                  key="disabled"
                  label={locale.t("ShowLoadUrl:PickerLabel")}
                  value=""
                />
                {this.renderPickerItems(this.state.storedDataUrl)}
              </Picker>
            </Dialog.Content>
            <Dialog.Actions>
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
                onPress={this.changeURL}
              >
                {locale.t("Save")}
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={this.state.showAddUrl}>
            <Dialog.Title>{locale.t("ShowLoadUrl:AddUrl")}</Dialog.Title>
            <Dialog.Content>
              <Text style={{ fontFamily: "Poppins-Medium" }}>
                {locale.t("ShowLoadUrl:EnvironmentUrl")}
              </Text>
              <TextInput
                allowFontScaling={false}
                mode="outlined"
                placeholder={locale.t("ShowLoadUrl:Example")}
                onChangeText={currentAddUrl => this.setState({ currentAddUrl })}
                defaultValue={this.state.currentAddUrl}
                textContentType="URL"
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
                    fontSize: 15,
                    fontFamily: "Poppins-Medium"
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
        </Portal>
      </View>
    );
  }
}

export default withTheme(Settings);
const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: "100%",
    marginTop: 25
  }
});
