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
          params={props.route.params}
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
          }}
          name={routeName}
        >
          {props => {
            if (props.route.params == null || parentProps.route.params.reset) {
              props.route.params = parentProps.route.params;
            }
            if (props.route.params?.reset) {
              delete props.route.params.reset;
            }
            return <Screens.CardView {...props} theme={defaultTheme} />;
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
