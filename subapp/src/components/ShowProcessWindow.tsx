import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, List, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import locale from "../i18n/locale";
import ScreenContext from "../contexts/ScreenContext";
import TabContext from "../contexts/TabContext";
import { componentsStyle, defaultTheme } from "../themes";
import AwesomeIcon from "react-native-vector-icons/FontAwesome";

interface Props {
  setShowWindow: Function;
  fabActions: any[];
}

const ShowProcessWindow = (props: Props) => {
  const { fabActions } = props;
  return (
    <View style={styles.processPopUp}>
      <View style={styles.headerView}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            props.setShowWindow(false);
          }}
        >
          <Button>
            <Icon name="close" size={25} color={defaultTheme.colors.text} />
          </Button>
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.headerText}>
          {locale.t("Tab:Actions")}
        </Text>
      </View>
      <View style={styles.divisor}></View>
      <ScrollView style={styles.scrollviewStyle}>
        {fabActions &&
          fabActions.map(process => (
            <List.Item
              key={process.key}
              title={process.label}
              left={() => (
                <AwesomeIcon
                  name="cogs"
                  size={20}
                  color={defaultTheme.colors.text}
                  style={styles.listIcon}
                />
              )}
              titleStyle={styles.itemTitle}
              onPress={() => {
                process.onPress(process.process);
              }}
            />
          ))}
      </ScrollView>
    </View>
  );
};

export { ShowProcessWindow };

const styles = StyleSheet.create({
  processPopUp: {
    backgroundColor: defaultTheme.colors.background,
    borderRadius: 5,
    width: "80%",
    alignSelf: "center",
    marginBottom: 150
  },
  headerView: {
    display: "flex",
    flexDirection: "row-reverse",
    flexGrow: 0,
    height: 40,
    marginVertical: 10,
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerText: {
    fontSize: 18,
    paddingLeft: 25,
    fontWeight: "bold",
    color: defaultTheme.colors.text
  },
  divisor: {
    backgroundColor: defaultTheme.colors.textSecondary,
    height: 0.5
  },
  scrollviewStyle: {
    flexGrow: 1
  },
  itemTitle: {
    color: defaultTheme.colors.text,
    fontSize: 15,
    marginRight: 25,
    justifyContent: "center"
  },
  listIcon: {
    paddingVertical: 20,
    paddingRight: 20,
    paddingLeft: 20
  }
});
