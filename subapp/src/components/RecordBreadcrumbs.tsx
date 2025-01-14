import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { defaultTheme } from "../themes";
import { BreadCrumbs } from "../types";

interface IRecordBreadcrumbsProps {
  breadcrumbs: string[];
}

const RecordBreadcrumbs = (props: IRecordBreadcrumbsProps) => {
  if (props.breadcrumbs && props.breadcrumbs.length > 1) {
    return (
      <View style={styles.breadcrumbsView}>
        <Text allowFontScaling={false}>
          {props.breadcrumbs.map((breadcrumb, index) => (
            <View key={`bc-${index}`} style={styles.breadcrumbsViewSecondary}>
              <Text allowFontScaling={false} style={styles.breadcrumbsText}>
                {breadcrumb}
              </Text>
              <Text allowFontScaling={false} style={styles.breadcrumbsArrow}>
                /
              </Text>
            </View>
          ))}
        </Text>
      </View>
    );
  } else {
    return null;
  }
};

export default RecordBreadcrumbs;

const styles = StyleSheet.create({
  breadcrumbsView: {
    backgroundColor: defaultTheme.colors.backgroundSecondary,
    padding: 5,
    flexDirection: "row",
    paddingHorizontal: 25.5,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: defaultTheme.colors.greyaccent
  },
  breadcrumbsViewSecondary: {
    flexDirection: "row"
  },
  breadcrumbsText: {
    color: defaultTheme.colors.text,
    fontSize: 15
  },
  breadcrumbsArrow: {
    color: defaultTheme.colors.textSecondary,
    fontSize: 15,
    paddingHorizontal: 8
  }
});
