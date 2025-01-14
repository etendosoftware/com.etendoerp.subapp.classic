import { observable, action } from "mobx";
import { OBRest } from "etrest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserUtils from "./utils/UserUtils";
import Windows from "./Windows";

export class User {
  @observable loading: any;
  @observable data;
  @observable token;
  @observable user;
  @observable selectedLanguage;
  @observable storedEnviromentsUrl;

  logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    this.token = undefined;
    this.user = undefined;
    this.data = undefined;
  };
  async saveToken(token?, user?) {
    await AsyncStorage.setItem(
      "token",
      token != undefined ? token : this.token
    );
    await AsyncStorage.setItem("user", user != undefined ? user : this.user);
  }
  async loadToken(token: string, user: string) {
    this.token = "";
    this.user = "";
  }

  @action
  async reloadUserData(storedToken?: string, user?: string) {
    if (storedToken) {
      await this.saveToken(storedToken, user);

      this.token = storedToken;
      OBRest.loginWithToken(storedToken);
    }

    let context = OBRest.getInstance().getOBContext();
    this.data = {
      username: user,
      userId: context?.getUserId(),
      defaultRoleId: context?.getRoleId(),
      defaultWarehouseId: context?.getWarehouseId(),
      roleId: context?.getRoleId(),
      warehouseId: context?.getWarehouseId(),
      organization: context?.getOrganizationId(),
      client: context?.getClientId()
    };

    this.selectedLanguage = await this.loadLanguage();
    await Windows.loadWindows(this.selectedLanguage);

    this.storedEnviromentsUrl = await this.loadEnviromentsUrl();
  }

  async login(user, pass) {
    await OBRest.loginWithUserAndPassword(user, pass);

    // TODO: this should be changed to a boolean isLoggedIn
    this.token = OBRest.getInstance()
      .getAxios()
      .defaults.headers.Authorization.replace("Bearer ", "");
    this.user = user;
    await this.reloadUserData();
    await this.saveToken();
    this.selectedLanguage = await this.loadLanguage();
    this.storedEnviromentsUrl = await this.loadEnviromentsUrl();
  }

  async saveLanguage(selectedLanguage) {
    await AsyncStorage.setItem(
      "selectedLanguage",
      selectedLanguage ? selectedLanguage : this.selectedLanguage
    );
    this.selectedLanguage = await this.loadLanguage();
  }

  loadLanguage() {
    return AsyncStorage.getItem("selectedLanguage");
  }

  async saveEnviromentsUrl(storedEnviromentsUrl) {
    if (storedEnviromentsUrl && storedEnviromentsUrl.length) {
      await AsyncStorage.setItem(
        "storedEnviromentsUrl",
        JSON.stringify(storedEnviromentsUrl)
      );
    }
  }

  async loadEnviromentsUrl() {
    let storedEnviromentsUrl = await AsyncStorage.getItem(
      "storedEnviromentsUrl"
    );
    if (storedEnviromentsUrl) {
      storedEnviromentsUrl = JSON.parse(storedEnviromentsUrl);
    }
    return storedEnviromentsUrl;
  }

  getContext(record?, fields?, entityName?) {
    return UserUtils.getContext(this, record, fields, entityName);
  }
}

const user = new User();
export default user;
