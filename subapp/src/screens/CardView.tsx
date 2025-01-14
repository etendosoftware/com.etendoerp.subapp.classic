import React, { useContext } from "react";
import { Dimensions, Platform, Text, View, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { User, Windows } from "../stores";
import {
  Appbar,
  Button,
  Colors,
  Menu,
  Portal,
  Snackbar,
  withTheme
} from "react-native-paper";
import locale from "../i18n/locale";
import { ProcessDialog, ScanDialog, Tab } from "../components";
import OBProcess from "../ob-api/classes/OBProcess";
import RecordBreadcrumbs from "../components/RecordBreadcrumbs";
import { componentsStyle, defaultTheme, ITheme } from "../themes";
import { INavigation } from "../components/Card";
import { IRecord, OnRecordSavedFunction } from "../types/Record";
import { IOBDalEntity } from "../ob-api/classes/OBDal";
import ScreenContext from "../contexts/ScreenContext";
import MainAppContext from "../contexts/MainAppContext";
import { FabAction } from "../types/FabAction";
import { CardViewBottomBar } from "../components/CardViewBottomBar";
import { TabType } from "../components/Tab";
import { ProcessDialogRouteParams } from "./ProcessDialogScreen";
import { ITabRoute } from "../types";
import { UI_PATTERNS } from "../ob-api/constants/uiPatterns";
import { useNavigation } from "@react-navigation/native";

const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";

const initialLayout = { width: Dimensions.get("window").width };
interface Props extends ITheme {
  route: any;
  navigation: INavigation;
}
interface State {
  level: number;
  tabIndex: number;
  tabRoutes: any[];
  recordId: string;
  parentRecordContext: string;
  selectedRecordId: string;
  selectedRecordContext: object;
  parentTabID: string;
  snackbarMessage: string;
  showSnackbar: boolean;
  snackbarColor: string;
  snackbarActionColor: string;
  showProcessMenu: boolean;
  disableProcessMenu: boolean;
  showFAB: boolean;
  fabActions: FabAction[];
  fabOpen: boolean;
  showProcessDialog: any;
  showScanDialog: boolean;
  processLoading: boolean;
  multipleSelectionMode: boolean;
  selectedRecordAmount: number;
  entitiesByLevel: IOBDalEntity[][];
  breadcrumbs: string[];
  processMenu: any;
  parentEntity?: IRecord;
  renderScene?: any; // () => React.ReactNode
  selectedRecords?: IRecord[];
  currentEntity: IOBDalEntity;
}

export interface ReloadFunction {
  (
    windowId: string,
    recordId?: string,
    level?: number,
    tabIndex?: number,
    parentTabID?: string,
    context?: any,
    parentEntity?: any
  ): void;
}

@observer
class CardViewObj extends React.Component<Props, State> {
  private currentRecord: IRecord;
  static contextType = MainAppContext;
  private breadcrumbLabel: string;
  context: any;

  constructor(props: Props) {
    super(props);
    this.context = props.context;
    const level = props.route?.params?.tabLevel || 0;
    const entitiesByLevel = Windows.getWindowEntities(
      props.route.params.windowId
    ) as IOBDalEntity[][];

    let currentEntity = Windows.getEntity(
      props.route.params.tabLevel,
      this.getTabIndex(0),
      entitiesByLevel || this.state.entitiesByLevel
    );

    if (!currentEntity) {
      currentEntity = entitiesByLevel[0][0]; // Header tab
    }

    const initialState: State = {
      level: level,
      tabRoutes: [],
      recordId: null, // used as parent record of tabs with level > 0
      parentRecordContext: null, // used by processes opened from the menu
      selectedRecordId: null, // used when card is opened
      selectedRecordContext: null, // used by processes opened from a FAB
      parentTabID: null,
      snackbarMessage: "",
      showSnackbar: false,
      snackbarColor: Colors.black,
      snackbarActionColor: Colors.white,
      showProcessMenu: false,
      disableProcessMenu: false,
      showFAB: false,
      fabActions: [],
      fabOpen: false,
      showProcessDialog: false,
      showScanDialog: false,
      processLoading: false,
      multipleSelectionMode: false,
      selectedRecordAmount: 0,
      entitiesByLevel: entitiesByLevel,
      breadcrumbs: [],
      processMenu: null,
      selectedRecords: [],
      currentEntity: currentEntity,
      parentEntity: this.props.route.params.parentEntity,
      tabIndex: null
    };
    this.state = initialState;
    this.currentRecord = this.props.route.params.currentRecord;
  }

  getWindowId() {
    return this.props.route.params.windowId;
  }

  getTabIndex(defaultValue = null): number {
    const val = this.props.route.params.tabIndex || defaultValue;
    if (val) {
      return parseInt(val);
    }
    return val;
  }

  getCurrentTab() {
    const tabRoutes = Windows.getTabRoutes(
      this.getWindowId(),
      this.state.level,
      this.getTabIndex()
    );
    let currentTab = null;
    if (tabRoutes[this.getTabIndex(0)]) {
      currentTab = Windows.getTab(
        this.getWindowId(),
        tabRoutes[this.getTabIndex(0)].key,
        this.state.level
      );
    } else {
      const tabRouteFiltered = tabRoutes.filter(
        tab => tab.key === this.getTabIndex(0)
      ) as ITabRoute[];
      if (tabRouteFiltered.length > 0) {
        currentTab = Windows.getTab(
          this.getWindowId(),
          tabRouteFiltered[0].key,
          this.state.level
        );
      }
    }
    return currentTab;
  }

  tabRef = React.createRef<TabType>();

  //TODO: This function is deprecated. Use the global Snackbar to handle messages to the user
  showSnackbar = (snackbarMessage, isError = false) => {
    let snackbarColor = this.props.theme.colors.onSurface;
    let snackbarActionColor = this.props.theme.colors.accent;

    if (isError) {
      snackbarColor = this.props.theme.colors.error;
      snackbarActionColor = this.props.theme.colors.text;
    }

    this.setState({
      showSnackbar: true,
      snackbarMessage,
      snackbarColor,
      snackbarActionColor
    });
  };

  showFAB = (selectedRecordId, selectedRecordContext) => {
    this.setState({ selectedRecordId, selectedRecordContext });
    this.setState({ showFAB: this.state.fabActions.length > 0 });
  };

  hideFAB = () => {
    this.setState({ selectedRecordId: null, selectedRecordContext: null });
    this.setState({ showFAB: false });
  };

  getFABActions = tab => {
    const tabProcesses = Windows.getTabProcesses(tab);
    const fabActions: FabAction[] = tabProcesses.map(tabProcess => {
      return {
        key: tabProcess.id,
        icon: "check",
        label: tabProcess.name,
        process: tabProcess,
        onPress: tabProcess => {
          let currentRecord;
          if (this.props.route.params.currentRecord) {
            currentRecord = this.props.route.params.currentRecord;
          }
          let selectedRecordsIds;
          if (this.props.route.params.currentRecordId) {
            selectedRecordsIds = [this.props.route.params.currentRecordId];
          } else {
            selectedRecordsIds = this.state.selectedRecords.map(
              selectedRecord => selectedRecord.id
            );
          }
          const params: ProcessDialogRouteParams = {
            windowId: this.getWindowId(),
            level: this.state.level,
            //processMenu: processMenu,
            process: tabProcess,
            tabRoutes: this.state.tabRoutes,
            selectedRecordId: this.state.selectedRecordId,
            recordId: this.state.recordId,
            selectedRecordContext: this.state.selectedRecordContext,
            parentRecordContext: this.state.parentRecordContext,
            selectedRecordsIds: selectedRecordsIds,
            currentRecord: currentRecord,
            fields: this.getCurrentTab().fields
          };
          this.props.navigation.push("ProcessDialog", params);
        }
      };
    });
    return fabActions;
  };

  setFABActions = tab => {
    this.setState({ fabActions: this.getFABActions(tab) });
  };

  // deprecated
  reloadWindow: ReloadFunction = (
    windowId,
    recordId = null,
    level = 0,
    tabIndex = 0,
    parentTabID = null,
    context = null,
    parentEntity = null
  ) => {
    const tabRoutes = Windows.getTabRoutes(windowId, level, this.getTabIndex());
    this.setState({
      recordId,
      level,
      tabIndex,
      parentRecordContext: context,
      parentEntity,
      tabRoutes
    });

    // load parent processes for menu
    if (level > 0 && parentTabID) {
      const menuItems = Windows.getTabProcessesById(windowId, parentTabID);
      this.setState({
        parentTabID,
        disableProcessMenu: menuItems.length === 0,
        processMenu: { tabID: parentTabID, items: menuItems }
      });
    }
  };

  componentDidMount = () => {
    this.breadcrumbLabel = "";
    if (this.props.route.params.windowName) {
      this.breadcrumbLabel = this.props.route.params.windowName;
    } else if (this.props.route.params.label) {
      this.breadcrumbLabel = this.props.route.params.label;
    }
    this.newBreadcrumb(this.breadcrumbLabel);
    // Construct tab routes
    this.setFABActions(this.getCurrentTab());
  };

  componentWillUnmount = () => {
    this.removeBreadcrumb(this.breadcrumbLabel);
  };

  componentDidUpdate = (prevProps: Props) => {
    if (this.props.route.params.key != prevProps.route.params.key) {
      this.reloadWindow(this.getWindowId());
    }
  };

  toggleProcessMenu = () => {
    this.setState({ showProcessMenu: !this.state.showProcessMenu });
  };

  changeAppbarMode = selectionMode => {
    this.setState({ multipleSelectionMode: selectionMode });
  };

  updateSelectedRecordAmount = newValue => {
    this.setState({ selectedRecordAmount: newValue });
  };

  renderAppbar = () => {
    let currentTab = this.getCurrentTab();

    if (this.state.multipleSelectionMode) {
      return (
        <>
          <Appbar.Header>
            <Appbar.Action
              icon="cancel"
              color={this.props.theme.colors.surface}
              size={22}
              style={styles.selectedCancelStyle}
              onPress={() => {
                this.setState({
                  multipleSelectionMode: false,
                  selectedRecords: []
                });
                this.tabRef.current?.toggleMultipleSelectionMode();
              }}
            />
            <Appbar.Content
              titleStyle={componentsStyle.appbarTitle}
              title={this.props.route.params.windowName}
            />
          </Appbar.Header>
          <Appbar.Header style={styles.selectedBarStyle}>
            <Appbar.Content
              titleStyle={styles.selectedQuantityStyle}
              title={
                this.state.selectedRecordAmount +
                " " +
                locale.t("CardView:Selected")
              }
            />
            <Appbar.Action
              icon="delete"
              color={this.props.theme.colors.primary}
              size={22}
              style={styles.selectedDeleteStyle}
              onPress={this.tabRef.current?.onDeleteSelected}
              disabled={
                currentTab.uIPattern == UI_PATTERNS.RO ||
                currentTab.uIPattern == UI_PATTERNS.SR
              }
            />
          </Appbar.Header>
        </>
      );
    } else {
      let leftAction;
      if (!this.props.route.params.currentRecordId && this.state.level == 0) {
        leftAction = (
          <Appbar.Action
            icon="menu"
            onPress={() => this.props.navigation.toggleDrawer()}
          />
        );
      } else {
        leftAction = (
          <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
        );
      }

      return (
        <Appbar.Header>
          {leftAction}
          <Appbar.Content
            titleStyle={componentsStyle.appbarTitle}
            title={this.props.route.params.windowName}
          />
        </Appbar.Header>
      );
    }
  };

  newBreadcrumb = (breadcrumb: string) => {
    const breadcrumbs = this.context.getBreadcrumbs(this.getWindowId());
    breadcrumbs.push(breadcrumb);
    this.setState({ breadcrumbs: breadcrumbs });
  };

  removeBreadcrumb = (breadcrumb: string) => {
    const breadcrumbs = this.context.getBreadcrumbs(this.getWindowId());
    breadcrumbs.pop();
    this.setState({ breadcrumbs: breadcrumbs });
  };

  render() {
    const fabActions = this.getFABActions(this.getCurrentTab());
    return (
      <ScreenContext.Provider
        value={{
          windowId: this.getWindowId(),
          currentRecord: this.currentRecord,
          entitiesByLevel: this.state.entitiesByLevel,
          eventSubscribe: this.context.eventSubscribe,
          eventUnsubscribe: this.context.eventUnsubscribe,
          eventEmitter: this.context.eventEmitter,
          selectedRecords: this.state.selectedRecords,
          fabActions: fabActions
        }}
      >
        <View style={{ flex: 1 }}>
          {this.renderAppbar()}
          {this.state.breadcrumbs && (
            <RecordBreadcrumbs breadcrumbs={this.state.breadcrumbs} />
          )}
          <Tab
            ref={this.tabRef}
            isSalesTransaction={this.props.route.params.isSalesTransaction}
            tabIndex={this.getTabIndex(0).toString()}
            entityType={this.state.currentEntity}
            parentEntity={this.state.parentEntity}
            context={User.getContext()}
            showSnackbar={this.showSnackbar}
            showFAB={this.showFAB}
            hideFAB={this.hideFAB}
            changeAppbarMode={this.changeAppbarMode}
            updateSelectedRecordAmount={this.updateSelectedRecordAmount}
            reloadWindow={this.reloadWindow}
            navigation={this.props.navigation}
            currentRecordId={this.props.route.params?.currentRecordId as string}
            parentRecordId={this.props.route.params.parentRecordId as string}
            onRecordSaved={
              this.props.route.params.onRecordSaved as OnRecordSavedFunction
            }
          />

          {this.state.multipleSelectionMode && (
            <CardViewBottomBar fabActions={fabActions} />
          )}
          <Snackbar
            style={{
              flex: 1,
              justifyContent: "space-between",
              width: "75%",
              marginBottom: 20
            }}
            visible={this.state.showSnackbar}
            onDismiss={() =>
              this.setState({ showSnackbar: false, snackbarMessage: "" })
            }
            action={{
              label: locale.t("DismissSnackBar"),
              onPress: () => {
                this.setState({ showSnackbar: false });
              }
            }}
            duration={
              // @ts-ignore
              Snackbar.SHORT_DURATION
            }
            theme={{
              colors: {
                onSurface: this.state.snackbarColor,
                accent: this.state.snackbarActionColor
              }
            }}
          >
            {this.state.snackbarMessage}
          </Snackbar>
        </View>
      </ScreenContext.Provider>
    );
  }
}
const CardView = (props: any) => {
  if (props.context) delete props.context;
  const navigation = useNavigation();
  const context = useContext(MainAppContext);
  return <CardViewObj {...props} navigation={navigation} context={context} />;
};

export default withTheme(CardView);

const styles = StyleSheet.create({
  selectedBarStyle: {
    backgroundColor: defaultTheme.colors.backgroundSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: defaultTheme.colors.greyaccent
  },
  selectedCancelStyle: {
    marginLeft: 14
  },
  selectedDeleteStyle: {
    marginRight: 22
  },

  selectedQuantityStyle: {
    color: defaultTheme.colors.primary,
    marginLeft: 14,
    fontWeight: "normal",
    fontSize: 15
  }
});
