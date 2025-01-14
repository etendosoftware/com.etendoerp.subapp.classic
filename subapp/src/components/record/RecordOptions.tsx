import React from "react";
import { List } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { INavigation } from "../Card";
import { defaultTheme } from "../../themes";
import { CardDataParams } from "../../types/CardDataParams";

interface RecordOptionsProps {
  navigation: INavigation;
  windowId: any;
  cardDataTab: CardDataParams;
  tabRoutes: any;
}

const RecordOptions = (props: RecordOptionsProps) => {
  const { tabRoutes } = props;

  return (
    <View>
      {tabRoutes.map(route => (
        <List.Item
          key={route.key + route.title}
          style={styles.listItem}
          title={route.title}
          left={() => <List.Icon icon="folder" />}
          titleStyle={styles.itemTitle}
          onPress={() => {
            props.navigation.push(
              props.windowId,
              props.cardDataTab.route(route.key, route.title)
            );
          }}
        />
      ))}
    </View>
  );
};

export default RecordOptions;

const styles = StyleSheet.create({
  itemTitle: {
    color: defaultTheme.colors.text,
    fontSize: 15,
    marginRight: 25
  },
  listItem: {
    marginTop: 0,
    paddingTop: 10
  }
});
