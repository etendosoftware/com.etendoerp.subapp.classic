import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { User, Windows } from "./src/stores";
import { observer } from "mobx-react";
import locale from "./src/i18n/locale";
import { Provider as PaperProvider } from "react-native-paper";
import Snackbar from "./src/components/Snackbar";
import { Snackbar as GlobalSnackbar } from "./src/globals";
import MainAppContext, { APP_EVENT } from "./src/contexts/MainAppContext";
import { AppHome } from "./src/navigation/AppNavigation";
import { defaultTheme } from "./src/themes";
import Languages from "./src/ob-api/objects/Languages";
import { supportedLocales } from "./src/i18n/config";
import { isTablet } from "./hooks/IsTablet";
import Orientation from "react-native-orientation-locker";
import { EtendoLanguage } from "./src/screens/auth/Login";

interface State {
  fontLoaded: boolean;
  selectedLanguage: string;
  languages: any[];
  updateLanguageList: boolean;
}

@observer
class AppO extends React.Component<State> {
  state = {
    selectedLanguage: null,
    fontLoaded: true,
    languages: [],
    breadcrumbs: {}
  };
  eventsPool = { RECORD_UPDATE: [] };
  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {
    StatusBar.setBarStyle("light-content", true);
    if (isTablet()) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
    await this.updateLanguageList();
  };

  changeLanguage = async (input: string) => {
    locale.setCurrentLanguage(input);
    if (User.user) {
      Windows.loading = true;
      await Windows.loadWindows(input);
      Windows.loading = false;
    }
    this.setState({ selectedLanguage: input });
  };

  updateLanguageList = async () => {
    const languages = await this.getLanguages();
    this.setState({ languages });
  };

  public eventSubscribe = async (appEvent: APP_EVENT, key, func) => {
    if (!this.eventsPool[appEvent]) {
      this.eventsPool[appEvent] = {};
    }
    if (this.eventsPool[appEvent][key]) {
      delete this.eventsPool[appEvent][key];
    }
    this.eventsPool[appEvent][key] = func;
  };

  eventUnsubscribe = async (appEvent: APP_EVENT, key) => {
    if (this.eventsPool[appEvent][key]) {
      delete this.eventsPool[appEvent][key];
    }
  };

  eventEmitter = async (appEvent: APP_EVENT, key, data) => {
    if (this.eventsPool[appEvent][key]) {
      try {
        this.eventsPool[appEvent][key](data);
      } catch (e) {
        console.error(e);
      }
    }
  };
  async getLanguages() {
    //Etendo languages
    let etendoLanguages: any = [];
    try {
      etendoLanguages = await this.getServerLanguages();
    } catch (ignored) {}

    const etendoLocalLanguages = etendoLanguages.map(f => {
      return { id: f.id, value: f.language, label: f.name };
    });
    //App languages
    const localLanguages = Object.keys(supportedLocales);
    const appLanguages = localLanguages.map(localLanguage => {
      return {
        id: localLanguage,
        value: localLanguage.replace("-", "_"),
        label: supportedLocales[localLanguage].name
      };
    });

    //Intersection of both languages
    return etendoLanguages.length === 0
      ? appLanguages
      : this.inBoth(appLanguages, etendoLocalLanguages);
  }
  // Generic helper function that can be used for the three operations:
  operation(list1, list2, isUnion) {
    var result = [];

    for (var i = 0; i < list1.length; i++) {
      var item1 = list1[i],
        found = false;
      for (var j = 0; j < list2.length && !found; j++) {
        found = item1.value === list2[j].value;
      }
      if (found === !!isUnion) {
        // isUnion is coerced to boolean
        result.push(item1);
      }
    }
    return result;
  }

  // Following functions are to be used:
  inBoth(list1, list2) {
    return this.operation(list1, list2, true);
  }

  getServerLanguages = () => {
    return Languages.getLanguages();
  };

  getBreadcrumbs = (windowId: string): string[] => {
    console.log("getBreadcrumbs", windowId);
    if (!this.state.breadcrumbs[windowId]) {
      this.state.breadcrumbs[windowId] = [];
    }
    return this.state.breadcrumbs[windowId];
  };

  loadWindows = async token => {
    const {
      selectedLanguage,
      changeLanguage,
      updateLanguageList
    } = this.context;
    updateLanguageList();
    const etendoLanguages = (await Languages.getLanguages()) as EtendoLanguage[];
    if (
      etendoLanguages.filter(lang => lang.language === selectedLanguage)
        .length === 0
    ) {
      changeLanguage(selectedLanguage);
    } else {
      if (!Windows.hydrated || !token) {
        await Windows.loadWindows(selectedLanguage);
      }
    }
  };

  render() {
    const { selectedLanguage, languages } = this.state;
    return (
      <PaperProvider theme={defaultTheme}>
        <MainAppContext.Provider
          value={{
            changeLanguage: this.changeLanguage,
            selectedLanguage: selectedLanguage,
            languages,
            updateLanguageList: this.updateLanguageList,
            eventSubscribe: this.eventSubscribe,
            eventUnsubscribe: this.eventUnsubscribe,
            eventEmitter: this.eventEmitter,
            getBreadcrumbs: this.getBreadcrumbs
          }}
        >
          {this.state && this.state.fontLoaded && (
            <>
              <AppHome
                navigationContainer={this.props.navigationContainer}
                menuItems={this.props.menuItems}
              />
              <Snackbar ref={ref => (GlobalSnackbar.instance = ref)} />
            </>
          )}
        </MainAppContext.Provider>
      </PaperProvider>
    );
  }
}
const App = ({ ...props }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      locale.setCurrentLanguage(props.language);
      await User.saveLanguage(props.language);
      await User.reloadUserData(props.token, props.user);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <AppO
        navigationContainer={props.navigationContainer}
        menuItems={menuItems}
        setMenuItems={setMenuItems}
      />
    </>
  );
};

export { App };
export default App;
