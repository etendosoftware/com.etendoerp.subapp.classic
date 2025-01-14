import React from "react";
import { View, StyleSheet } from "react-native";
import { isTablet } from "../../../hooks/IsTablet";
import CardInfoField, { Props as CardInfoFieldProps } from "./CardInfoField";

interface Props {
  identifiers: CardInfoFieldProps[];
}

interface State {}

class CardContent extends React.Component<Props, State> {
  render() {
    const { identifiers } = this.props;
    return (
      <View style={styles.field}>
        {identifiers.slice(1).map(identifier => (
          <CardInfoField
            key={identifier.id}
            name={identifier.name}
            value={identifier.value}
          />
        ))}
      </View>
    );
  }
}

export default CardContent;

const styles = StyleSheet.create({
  field: {
    display: "flex",
    flexDirection: isTablet() ? "row" : "column",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    flex: 1
  }
});
