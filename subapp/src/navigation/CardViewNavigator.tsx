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
  // route/state objects are frozen (react-navigation dev mode), so the previous
  // "delete params.reset after first use" trick silently no-ops. Track consumption
  // by object identity instead of mutating the frozen params.
  const consumedParentParams = React.useRef(null);

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
            const parentParams = parentProps.route.params;
            const useParent =
              props.route.params == null ||
              (parentParams?.reset && consumedParentParams.current !== parentParams);
            if (useParent) {
              consumedParentParams.current = parentParams;
            }
            const source = useParent ? parentParams : props.route.params;
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
