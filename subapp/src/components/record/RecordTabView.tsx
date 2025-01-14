import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  useWindowDimensions,
  View,
  StyleSheet,
  Text,
  Pressable
} from "react-native";
import {
  Button,
  Card as PaperCard,
  List,
  Modal,
  FAB
} from "react-native-paper";
import { componentsStyle } from "../../themes";
import { NEW_RECORD } from "../../types/RouteParams";
import RecordForm from "./RecordForm";
import { INavigation } from "../Card";
import { CardDataParams } from "../../types/CardDataParams";
import TabContext from "../../contexts/TabContext";
import { Windows } from "../../stores";
import locale from "../../i18n/locale";
import RecordOptions from "./RecordOptions";
import { APP_EVENT } from "../../contexts/MainAppContext";
import { defaultTheme } from "../../themes";
import IonIcon from "react-native-vector-icons/Ionicons";
import AwesomeIcon from "react-native-vector-icons/FontAwesome";
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from "rn-placeholder";
import { ShowProcessWindow } from "../ShowProcessWindow";
import { Snackbar } from "../../globals";
import { UI_PATTERNS } from "../../ob-api/constants/uiPatterns";
import { TouchableOpacity } from "react-native-gesture-handler";

interface IRecordTabViewProps {
  navigation: INavigation;
  done?: any;
}

const RecordTabView = (props: IRecordTabViewProps) => {
  const {
    currentRecord,
    currentTab,
    loadFields,
    entitiesByLevel,
    tabLevel,
    tabIndex,
    isSalesTransaction,
    windowId,
    windowName,
    displayedIdentifiers,
    fields,
    fabActions,
    onSave,
    eventEmitter,
    entityType
  } = useContext(TabContext);
  const values = loadFields(currentRecord);

  const cardData = new CardDataParams({
    label: values.title,
    isSalesTransaction: isSalesTransaction,
    windowId: windowId,
    windowName: windowName,
    entitiesByLevel: entitiesByLevel,
    tabLevel: tabLevel,
    tabIndex: tabIndex,
    currentRecordId: currentRecord.id // currentRecordId
  });

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "values", title: locale.t("Tab:Values") },
    { key: "options", title: locale.t("Tab:Options") }
  ]);
  const [showTabs, setShowTabs] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);
  if (currentRecord) {
    let displayedIdentifier = null;
    if (displayedIdentifiers && values.displayedIdentifiers.length > 0) {
      displayedIdentifier = values.displayedIdentifiers[0].value;
    }
    if (!displayedIdentifier) {
      displayedIdentifier = currentRecord.id;
    }
  }

  const cardDataTab = new CardDataParams({
    label: cardData.label,
    isSalesTransaction: cardData.isSalesTransaction,
    windowId: cardData.windowId,
    windowName: cardData.windowName,
    entitiesByLevel: entitiesByLevel.entitiesByLevel,
    tabLevel: cardData.tabLevel + 1,
    parentRecordId: cardData.currentRecordId,
    parentEntity: entityType.entityName
  });

  const tabRoutes = Windows.getTabRoutes(windowId, tabLevel + 1);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  const validateMandatoryFields = () => {
    for (let field in fields) {
      if (
        fields[field] &&
        fields[field].column &&
        fields[field].column.mandatory == true &&
        fields[field].displayed == true &&
        (typeof currentRecord[field] == "undefined" ||
          currentRecord[field] == null ||
          currentRecord[field] === "")
      ) {
        return false;
      }
    }
    return true;
  };

  const onPress = () => {
    let validateMandatory = validateMandatoryFields();
    if (validateMandatory == false) {
      Snackbar.showError(locale.t("CardView:MandatoryFields"), 5000);
      return;
    }
    onSave(currentRecord)
      .then(newRecord => {
        for (var key in currentRecord) {
          currentRecord[key] = newRecord[key];
        }

        newRecord.highlight = true;
        eventEmitter(
          APP_EVENT,
          currentRecord.id ? currentRecord.id : NEW_RECORD,
          newRecord
        );
        Snackbar.showMessage(locale.t("CardView:RecordSaved"), 3000);
      })
      .catch(error => {
        // do nothing error is handled in Tab.tsx onSave
      });
  };

  enum TYPE {
    TABS,
    PROCESS
  }
  const show = (type: TYPE) => {
    if (type === TYPE.TABS) {
      setShowTabs(!showTabs);
      setShowActions(false);
    }

    if (type === TYPE.PROCESS) {
      setShowTabs(false);
      setShowActions(!showActions);
    }
  };

  const foldersDisabled = tabRoutes.length === 0 || !currentRecord.id;
  const actionsDisabled = fabActions.length === 0;

  return (
    <View style={styles.formView}>
      {loading && (
        <View style={styles.placeholderStyle}>
          <Placeholder Animation={Fade} Left={PlaceholderMedia}>
            <PlaceholderLine width={80} />
            <PlaceholderLine />
            <PlaceholderLine width={30} />
          </Placeholder>
        </View>
      )}
      {!loading && (
        <View style={styles.scrollviewStyleFirst}>
          <View style={styles.scrollviewStyleSecond}>
            <ScrollView>
              <RecordForm navigation={props.navigation} fields={fields} />
            </ScrollView>
          </View>
          <View>
            <View style={componentsStyle.bottomToolbar}>
              <Pressable
                disabled={foldersDisabled}
                style={[
                  styles.buttonView,
                  { opacity: foldersDisabled ? 0.5 : 1 }
                ]}
                onPress={() => {
                  show(TYPE.TABS);
                }}
              >
                <IonIcon
                  name="folder"
                  style={styles.buttonColor}
                  size={27}
                  containerStyle={styles.iconAlignment}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.buttonColor, styles.buttonText]}
                >
                  {locale.t("Tab:Folders")}
                </Text>
              </Pressable>
              <Pressable
                disabled={actionsDisabled}
                style={[
                  styles.buttonView,
                  styles.centerButton,
                  { opacity: actionsDisabled ? 0.5 : 1 }
                ]}
                onPress={() => {
                  show(TYPE.PROCESS);
                }}
              >
                <AwesomeIcon
                  name="cogs"
                  style={styles.buttonColor}
                  size={27}
                  containerStyle={styles.iconAlignment}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.buttonColor, styles.buttonText]}
                >
                  {locale.t("Tab:Actions")}
                </Text>
              </Pressable>
              <Pressable style={styles.buttonView}>
                <IonIcon
                  name="attach"
                  style={styles.buttonAttachments}
                  size={27}
                  containerStyle={styles.iconAlignment}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.buttonAttachments, styles.buttonText]}
                >
                  {locale.t("Tab:Attachments")}
                </Text>
              </Pressable>
            </View>
          </View>
          <FAB
            style={styles.secondaryFab}
            small={false}
            icon="content-save"
            onPress={onPress}
            visible={
              showTabs === false &&
              showActions === false &&
              currentTab.uIPattern != UI_PATTERNS.RO
            }
          />
        </View>
      )}
      <Modal
        visible={showTabs}
        onDismiss={() => {
          setShowTabs(false);
        }}
        style={styles.modalView}
      >
        <View style={styles.folderPopUp}>
          <View style={styles.folderHeaderStyle}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowTabs(false);
              }}
            >
              <Button>
                <IonIcon
                  name="close"
                  size={25}
                  color={defaultTheme.colors.text}
                />
              </Button>
            </TouchableOpacity>
            <Text allowFontScaling={false} style={styles.headerText}>
              {locale.t("Tab:Folders")}
            </Text>
          </View>
          <View style={styles.divisor}></View>
          <ScrollView style={styles.folderScroll}>
            <RecordOptions
              tabRoutes={tabRoutes}
              navigation={props.navigation}
              windowId={windowId}
              cardDataTab={cardDataTab}
            />
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={showActions}
        onDismiss={() => {
          setShowActions(false);
        }}
        style={styles.modalView}
      >
        <ShowProcessWindow
          fabActions={fabActions}
          setShowWindow={setShowActions}
        />
      </Modal>
    </View>
  );
};

export default RecordTabView;

const styles = StyleSheet.create({
  secondaryFab: {
    position: "absolute",
    margin: 16,
    bottom: 75,
    right: 10,
    backgroundColor: defaultTheme.colors.primary,
    fontSize: 30
  },
  formView: {
    display: "flex",
    flex: 1,
    backgroundColor: defaultTheme.colors.backgroundSecondary
  },
  placeholderStyle: {
    margin: 20
  },
  scrollviewStyleFirst: {
    flexDirection: "column",
    height: "100%",
    marginTop: 15
  },
  scrollviewStyleSecond: {
    flexShrink: 1,
    flexGrow: 1,
    paddingBottom: 10
  },
  buttonView: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "33%",
    paddingLeft: 4,
    marginTop: -8
  },
  centerButton: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderLeftColor: defaultTheme.colors.greyaccent,
    borderRightColor: defaultTheme.colors.greyaccent
  },
  iconAlignment: {
    alignSelf: "center"
  },
  buttonText: {
    marginTop: 2,
    fontSize: 13
  },
  buttonColor: {
    color: defaultTheme.colors.surface
  },
  buttonAttachments: {
    color: defaultTheme.colors.surface,
    opacity: 0.5
  },
  folderPopUp: {
    backgroundColor: defaultTheme.colors.background,
    borderRadius: 5,
    width: "80%",
    alignSelf: "center",
    marginBottom: 100,
    height: "60%"
  },
  folderHeaderStyle: {
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
  folderScroll: {
    flexGrow: 1
  },
  modalView: {
    backgroundColor: "transparent",
    margin: 0,
    padding: 0
  }
});
