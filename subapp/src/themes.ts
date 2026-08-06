import { configureFonts, DefaultTheme } from "react-native-paper";
import { Theme } from "react-native-paper/lib/typescript/types";
import { Platform, StyleSheet } from "react-native";

const fontConfig = {
  ios: {
    regular: {
      fontFamily: "Poppins"
    },
    medium: {
      fontFamily: "Poppins-Medium"
    },
    light: {
      fontFamily: "Poppins-Light"
    },
    thin: {
      fontFamily: "Poppins-Thin"
    }
  },
  android: {
    regular: {
      fontFamily: "Poppins"
    },
    medium: {
      fontFamily: "Poppins-Medium"
    },
    light: {
      fontFamily: "Poppins-Light"
    },
    thin: {
      fontFamily: "Poppins-Thin"
    }
  }
};

export const defaultTheme: Theme = {
  ...DefaultTheme,
  // Runtime react-native-paper is v5 (MD3 by default). This theme's flat MD2-style
  // colors (primary/surface/etc, no elevation scale) only render correctly under the
  // MD2 code paths, so force those paths instead of MD3's (e.g. Appbar.Header ignores
  // `dark` and paints theme.colors.surface under MD3, which is white here).
  // PaperProvider derives isV3 from `version` (defaulting to 3) and overwrites any
  // isV3 set directly, so `version: 2` is the actual switch — not `isV3`.
  version: 2,
  roundness: 5,
  colors: {
    ...DefaultTheme.colors,
    primary: "#202452",
    accent: "#fad614",
    background: "#ffffff",
    backgroundSecondary: "#f2f2f2",
    error: "#ff012f",
    success: "#b0ff0c",
    text: "#000000",
    textSecondary: "#383838",
    surface: "#ffffff",
    onSurface: "#000000",
    greyaccent: "#999999",
    greybackgroundSecondary: "#e2e2e2",
    greyborders: "#cccccc"
  }
  //fonts: configureFonts(fontConfig),
};

export interface ITheme {
  theme: ReactNativePaper.Theme;
}

export const componentsStyle = StyleSheet.create<{
  inputText;
  inputLabel;
  subheading;
  formBody;
  modalCallButton;
  modalCallLabel;
  fieldContainer;
  bottomToolbar;
}>({
  inputText: {
    borderColor: defaultTheme.colors.greyborders,
    borderWidth: 1,
    borderRadius: 3,
    marginTop: 2,
    marginBottom: 2,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    backgroundColor: defaultTheme.colors.background,
    height: 45,
    fontSize: 15
  },
  inputLabel: {
    fontSize: 15,
    color: defaultTheme.colors.text
  },
  subheading: {
    fontWeight: "bold",
    color: defaultTheme.colors.primary,
    textAlignVertical: "center"
  },
  formBody: {
    padding: 10,
    margin: 15,
    flexGrow: 1
  },
  modalCallButton: {
    backgroundColor: defaultTheme.colors.background,
    textTransform: "none",
    borderRadius: 5,
    padding: 7,
    color: defaultTheme.colors.primary
  },
  modalCallLabel: {
    textAlign: "left",
    textAlignVertical: "center",
    paddingRight: 5,
    color: defaultTheme.colors.text
  },
  fieldContainer: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: defaultTheme.colors.greybackgroundSecondary
  },

  bottomToolbar: {
    backgroundColor: defaultTheme.colors.primary,
    padding: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    flexDirection: "row",
    shadowColor: defaultTheme.colors.text,
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
    elevation: 5,
    height: 84
  }
});
