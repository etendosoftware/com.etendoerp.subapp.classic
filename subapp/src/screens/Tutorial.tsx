import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Image, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Button, withTheme } from "react-native-paper";
import Swiper from "react-native-swiper";
import locale from "../i18n/locale";
import { defaultTheme } from "../themes";
import imgTutorial1 from "../img/tutorial-1.png";
import imgTutorial2 from "../img/tutorial-2.png";
import imgTutorial3 from "../img/tutorial-3.png";
import imgTutorial4 from "../img/tutorial-4.png";

const Tutorial = () => {
  const navigation = useNavigation();

  const finish = () => {
    navigation.navigate("Home");
  };

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: defaultTheme.colors.background
      }}
    >
      <Text allowFontScaling={false} style={styles.text}>
        TUTORIAL
      </Text>
      <Swiper
        style={styles.wrapper}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={{ bottom: -10 }}
        showsButtons={true}
        loop={false}
      >
        <View style={styles.slide}>
          <Image
            style={styles.image}
            resizeMode={"contain"}
            source={{ uri: imgTutorial1 }}
          />
        </View>
        <View style={styles.slide}>
          <Image
            style={styles.image}
            resizeMode={"contain"}
            source={{ uri: imgTutorial2 }}
          />
        </View>
        <View style={styles.slide}>
          <Image
            style={styles.image}
            resizeMode={"contain"}
            source={{ uri: imgTutorial3 }}
          />
        </View>
        <View style={styles.slide}>
          <Image
            style={styles.image}
            resizeMode={"contain"}
            source={{ uri: imgTutorial4 }}
          />
        </View>
      </Swiper>
      <TouchableOpacity activeOpacity={0.6} onPress={finish}>
        <Button
          labelStyle={{ color: defaultTheme.colors.text }}
          style={{
            width: "35%",
            alignSelf: "flex-end",
            marginRight: 20,
            marginBottom: 15
          }}
        >
          {locale.t("Finish")}
        </Button>
      </TouchableOpacity>
    </View>
  );
};

export default withTheme(Tutorial);

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignSelf: "center",
    height: "60%",
    width: "75%"
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
    height: "100%",
    width: "100%"
  },
  text: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 18,
    color: defaultTheme.colors.text
  },
  dot: {
    backgroundColor: defaultTheme.colors.greyaccent,
    width: 13,
    height: 13,
    borderRadius: 7,
    marginLeft: 7,
    marginRight: 7
  },
  activeDot: {
    backgroundColor: defaultTheme.colors.primary,
    width: 13,
    height: 13,
    borderRadius: 7,
    marginLeft: 7,
    marginRight: 7
  }
});
