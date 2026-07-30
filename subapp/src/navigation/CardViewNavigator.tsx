import React from "react";
import {
  CardStyleInterpolators,
  createStackNavigator
} from "@react-navigation/stack";
import { defaultTheme } from "../themes";
import { View } from "react-native";
import * as Screens from "../screens";

const Stack = createStackNavigator();

const CardViewStackNavigator = props => {
  const parentProps = props;
  const routeName = props.route.params.windowId;

  return (
    <Stack.Navigator
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => <View></View>
      }}
    >
      {
        // @ts-ignore
        <Stack.Screen
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }}
          name={routeName}
        >
          {props => {
            // react-navigation v7 freezes route/state objects in dev mode, so this can no
            // longer mutate props.route.params directly (silently no-ops, leaving params
            // undefined). Compute the effective params and pass a fresh route object instead.
            const source =
              props.route.params == null || parentProps.route.params?.reset
                ? parentProps.route.params
                : props.route.params;
            const { reset, ...params } = source || {};
            return (
              <Screens.CardView
                {...props}
                route={{ ...props.route, params }}
                theme={defaultTheme}
              />
            );
          }}
        </Stack.Screen>
      }
      <Stack.Screen
        name="ProcessDialog"
        component={Screens.ProcessDialogScreen}
      />
    </Stack.Navigator>
  );
};

export { CardViewStackNavigator };
