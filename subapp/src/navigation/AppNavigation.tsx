import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import * as Screens from "../screens";
import { CardViewStackNavigator } from "./CardViewNavigator";
import { Drawer } from "../components";
import locale from "../i18n/locale";
import User from "../stores/User";
import { isTablet } from "../../hooks/IsTablet";

export const DrawerNav = createDrawerNavigator();

export function AppLogin() {
  return (
    <DrawerNav.Navigator
      initialRouteName={"Login"}
      drawerStyle={{ width: User.token ? "65%" : 0 }}
      screenOptions={{ headerShown: false }}
    >
      <DrawerNav.Screen name="Login" component={Screens.Login} />
      <DrawerNav.Screen name={"Settings"} component={Screens.Settings} />
    </DrawerNav.Navigator>
  );
}
export function AppHome({ ...props }) {
  const navigationContainer = props.navigationContainer;
  return (
    <DrawerNav.Navigator
      initialRouteName={"Home"}
      screenOptions={{ unmountOnBlur: true, headerShown: false }}
      drawerContent={props => {
        return (
          <Drawer
            key={props.key}
            navigationContainer={navigationContainer}
            {...props}
          />
        );
      }}
      drawerStyle={{ width: User.token ? (isTablet() ? "30%" : "65%") : 0 }}
    >
      <DrawerNav.Screen name="Home" component={Screens.Home} options={{}} />

      <DrawerNav.Screen name="Tutorial" component={Screens.Tutorial} />
      <DrawerNav.Screen name="CardView1" component={CardViewStackNavigator} />
    </DrawerNav.Navigator>
  );
}
