import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Button, DefaultTheme, Modal, Portal } from "react-native-paper";
import { componentsStyle, defaultTheme } from "../themes";
import { FabAction } from "../types/FabAction";
import { ShowProcessWindow } from "./ShowProcessWindow";
import Icon from "react-native-vector-icons/FontAwesome";
import locale from "../i18n/locale";

interface Props {
  fabActions: any[];
}

const CardViewBottomBar = (props: Props) => {
  const [showWindow, setShowWindow] = useState(false);
  const actionsDisabled = props.fabActions.length === 0;
  return (
    <>
      <View style={componentsStyle.bottomToolbar}>
        <Pressable
          disabled={actionsDisabled}
          style={[
            styles.pressableStyle,
            { opacity: actionsDisabled ? 0.5 : 1 }
          ]}
          onPress={() => {
            setShowWindow(!showWindow);
          }}
        >
          <Icon
            name="cogs"
            color={DefaultTheme.colors.surface}
            size={27}
            styles={styles.buttonColor}
            containerStyle={styles.iconAlignment}
          />
          <Text style={styles.buttonText} allowFontScaling={false}>
            {locale.t("Tab:Actions")}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showWindow}
        onDismiss={() => {
          setShowWindow(false);
        }}
        style={styles.modalStyle}
      >
        <ShowProcessWindow
          fabActions={props.fabActions}
          setShowWindow={setShowWindow}
        />
      </Modal>
    </>
  );
};

export { CardViewBottomBar };

const styles = StyleSheet.create({
  modalStyle: {
    backgroundColor: "transparent",
    margin: 0,
    padding: 0
  },
  modalView: {
    backgroundColor: "transparent"
  },
  buttonColor: {
    color: defaultTheme.colors.surface
  },
  buttonText: {
    color: defaultTheme.colors.surface
  },
  iconAlignment: {
    alignSelf: "center"
  },
  pressableStyle: {
    width: "33%",
    alignItems: "center",
    justifyContent: "center"
  }
});
