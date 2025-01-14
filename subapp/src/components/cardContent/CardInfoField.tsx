import React from "react";
import { View, StyleSheet } from "react-native";
import { Caption, Title } from "react-native-paper";
import { isTablet } from "../../../hooks/IsTablet";
import locale from "../../i18n/locale";
import { defaultTheme } from "../../themes";

export interface Props {
  id?: string;
  name: string;
  value: string | boolean;
}

interface State {}

class CardInfoField extends React.Component<Props, State> {
  render() {
    const { name, value } = this.props;
    let stringValue = value?.toString();
    if (typeof value === "boolean") {
      stringValue = value ? locale.t("Yes") : locale.t("No");
    }
    return (
      <View style={styles.cardStyle}>
        <Caption style={styles.captionStyle} numberOfLines={1}>
          {name}:
        </Caption>
        <Title style={styles.titleStyle} numberOfLines={1}>
          {stringValue}
        </Title>
      </View>
    );
  }
}

export default CardInfoField;

const styles = StyleSheet.create({
  cardStyle: {
    display: "flex",
    flexDirection: isTablet() ? "column" : "row"
  },
  captionStyle: {
    width: isTablet() ? "100%" : "40%",
    color: defaultTheme.colors.textSecondary,
    fontSize: 14,
    alignSelf: "center",
    fontFamily:'Poppins-Medium'
  },
  titleStyle: {
    width: isTablet() ? "100%" : "60%",
    color: defaultTheme.colors.textSecondary,
    fontSize: 14,
    alignSelf: "center",
    fontFamily:'Poppins-Medium'
  }
});
