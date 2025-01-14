import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import locale from "../i18n/locale";
import { Appbar, Button, Dialog, FAB, List, Text } from "react-native-paper";
import { User } from "../stores";
import { observer } from "mobx-react";
import { OBRest, Restrictions } from "etrest";
import { IRecord } from "../types/Record";
import { INavigation } from "../components/Card";
import { defaultTheme } from "../themes";
import ShowProfilePicture from "../components/ShowProfilePicture";
import withAuthentication from "../withAuthentication";
import { isTablet } from "../../hooks/IsTablet";
import SettingsProfile from "../img/settings-profile.png";

interface Props {
  navigation: INavigation;
}

interface State {
  role: string;
  org: string;
  client: string;
  warehouse: string;
  image: string;
  showChangePicture: boolean;
}

@observer
class Profile extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      role: null,
      org: null,
      client: null,
      warehouse: null,
      image: null,
      showChangePicture: false
    };
  }

  componentDidMount = async () => {
    if (User.data) {
      Promise.all([
        this.getOrganizationName(),
        this.getRoleName(),
        this.getWarehouseName(),
        this.getClientName()
      ])
        .then(values => {
          const [org, role, warehouse, client] = values;
          this.setState({ org, role, warehouse, client });
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  };

  getStyleItemList = () => {
    return { width: isTablet() ? "50%" : "100%" };
  };

  getStyleList = () => {
    return { width: isTablet() ? "50%" : "80%", alignItems: "center" };
  };
  getStyleContainer = () => {
    return isTablet() ? styles.containerTablet : styles.containerMobile;
  };
  getStyleImageBackground = () => {
    return isTablet() ? styles.backgroundTablet : styles.backgroundMobile;
  };

  getOrganizationName = async () => {
    let criteria = OBRest.getInstance().createCriteria("Organization");
    criteria.add(Restrictions.equals("id", User.data.organization));
    var org: IRecord = await criteria.uniqueResult();
    return org.name;
  };

  getClientName = async () => {
    let criteria = OBRest.getInstance().createCriteria("ADClient");
    criteria.add(Restrictions.equals("id", User.data.client));
    let client: IRecord = await criteria.uniqueResult();
    return client.name;
  };
  getWarehouseName = async () => {
    let criteria = OBRest.getInstance().createCriteria("Warehouse");
    criteria.add(Restrictions.equals("id", User.data.warehouseId));
    let warehouse: IRecord = await criteria.uniqueResult();
    return warehouse?.name;
  };

  getRoleName = async () => {
    let criteria = OBRest.getInstance().createCriteria("ADRole");
    criteria.add(Restrictions.equals("id", User.data.roleId));
    let role: IRecord = await criteria.uniqueResult();
    return role.name;
  };

  ChangedImagProfile = () => {
    return (
      <Dialog
        visible={this.state.showChangePicture}
        style={{ height: "15%", justifyContent: "center" }}
      >
        <Dialog.Content>
          <Text
            allowFontScaling={false}
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {locale.t("Coming_Soon")}
          </Text>
        </Dialog.Content>
        <View style={{ width: "100%", alignSelf: "center" }}>
          <TouchableOpacity
            onPress={() => this.setState({ showChangePicture: false })}
            style={{
              backgroundColor: defaultTheme.colors.accent,
              width: "20%",
              alignSelf: "flex-end",
              marginRight: 20
            }}
          >
            <Button
              style={{ width: "100%", alignItems: "center" }}
              labelStyle={{ fontFamily: "Poppins-Medium" }}
            >
              {" "}
              Ok
            </Button>
          </TouchableOpacity>
        </View>
      </Dialog>
    );
  };

  render() {
    return (
      <View
        style={{
          backgroundColor: defaultTheme.colors.background,
          height: "100%"
        }}
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
          <Appbar.Content title={locale.t("Profile:Title")} />
        </Appbar.Header>
        <View style={this.getStyleContainer()}>
          <View style={{ alignItems: "center", marginTop: 20, width: "50%" }}>
            <View style={{ height: 140, alignItems: "center" }}>
              <ShowProfilePicture
                size={140}
                username={User.data.username}
              ></ShowProfilePicture>
              <FAB
                icon={"camera-plus-outline"}
                small={true}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  backgroundColor: defaultTheme.colors.backgroundSecondary
                }}
                color={defaultTheme.colors.text}
                onPress={() => [this.setState({ showChangePicture: true })]}
                visible={this.state.showChangePicture === false}
              />
            </View>
            <View style={{ justifyContent: "center", height: 40 }}>
              <Text
                allowFontScaling={false}
                style={{ fontSize: 20, fontFamily: "Poppins-Medium" }}
              >
                {User.data.username}
              </Text>
            </View>
          </View>

          <List.Section style={this.getStyleList()}>
            <List.Item
              title={locale.t("Profile:Role")}
              description={
                this.state.role === null || this.state.org === " "
                  ? "*"
                  : this.state.role
              }
              style={this.getStyleItemList()}
              descriptionStyle={{ paddingTop: 5 }}
              descriptionNumberOfLines={3}
              titleStyle={{ fontFamily: "Poppins-Regular" }}
            />
            <List.Item
              title={locale.t("Profile:Org")}
              description={
                this.state.org === null || this.state.org === " "
                  ? "*"
                  : this.state.org
              }
              style={this.getStyleItemList()}
              descriptionStyle={{ paddingTop: 5 }}
              descriptionNumberOfLines={3}
              titleStyle={{ fontFamily: "Poppins-Regular" }}
            />
            <List.Item
              title={locale.t("Profile:Client")}
              description={
                this.state.client === null || this.state.client === " "
                  ? "*"
                  : this.state.org
              }
              style={this.getStyleItemList()}
              descriptionStyle={{ paddingTop: 5 }}
              descriptionNumberOfLines={3}
              titleStyle={{ fontFamily: "Poppins-Regular" }}
            />

            <List.Item
              title={locale.t("Profile:warehouse")}
              description={
                this.state.warehouse === null || this.state.org === " "
                  ? "*"
                  : this.state.warehouse
              }
              style={this.getStyleItemList()}
              descriptionStyle={{ paddingTop: 5 }}
              descriptionNumberOfLines={3}
              titleStyle={{ fontFamily: "Poppins-Regular" }}
            />
          </List.Section>
        </View>
        <Image
          style={this.getStyleImageBackground()}
          source={SettingsProfile}
        />
        {this.ChangedImagProfile()}
      </View>
    );
  }
}

export default withAuthentication(Profile);

const styles = StyleSheet.create({
  backgroundMobile: {
    width: "100%",
    height: "50%",
    position: "absolute",
    top: "70%",
    zIndex: -1
  },
  backgroundTablet: {
    width: "70%",
    height: "100%",
    position: "absolute",
    top: "70%",
    left: "0%",
    zIndex: -1
  },
  containerMobile: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "auto"
  },
  containerTablet: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    top: "5%"
  }
});
