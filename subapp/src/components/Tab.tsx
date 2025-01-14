import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { Windows } from "../stores";
import { ActivityIndicator, Colors, FAB, withTheme } from "react-native-paper";
import locale from "../i18n/locale";
import { OBRest } from "etrest";
import { IOBDalEntity, OBDal } from "../ob-api/classes/OBDal";
import { NEW_RECORD } from "../types/RouteParams";
import { IRecord, OnRecordSavedFunction } from "../types/Record";
import { IGetContextFunction, INavigation } from "./Card";
import { ITheme, defaultTheme } from "../themes";
import { RecordService } from "../ob-api/services/RecordService";
import { OnCardNavigation, onSaveFunc } from "./record/RecordForm";
import { ReloadFunction } from "../screens/CardView";
import { CardDataParams } from "../types/CardDataParams";
import TabContext from "../contexts/TabContext";
import ScreenContext from "../contexts/ScreenContext";
import RecordTabView from "./record/RecordTabView";
import { DisplayedIdentifiers } from "../ob-api/objects/DisplayedIdentifiers";
import { APP_EVENT } from "../contexts/MainAppContext";
import {
  Fade,
  Placeholder,
  PlaceholderLine,
  PlaceholderMedia
} from "rn-placeholder";
import { SwipeableCard, TabSearchBar } from ".";
import { FilterValue } from "../types";
import { UI_PATTERNS } from "../ob-api/constants/uiPatterns";
import { ADTab } from "../ob-api/objects/ADTab";

export const obIdentifierKey = "$_identifier";

const MemoizedSwipeableCard = React.memo(SwipeableCard);

interface Props extends ITheme {
  windowName?: string;
  tabIndex: string;
  entityType: IOBDalEntity;
  isSalesTransaction: boolean;
  context: any;
  currentRecordId: string;
  showSnackbar: any;
  parentRecordId: string;
  showFAB: any;
  hideFAB: any;
  title?: string;
  navigation: INavigation;
  changeAppbarMode: any;
  updateSelectedRecordAmount: any;
  parentEntity: IRecord;
  reloadWindow: ReloadFunction;
  ref?: any;
  onRecordSaved: OnRecordSavedFunction;
}

export interface ILoadFieldsFunction {
  (record: IRecord): any;
}

export interface TabContextValue {
  onSave: Function;
  currentRecord: IRecord | null;
  setCurrentRecord: (record: IRecord) => void;
}

interface State {
  pageOffset?: number;
  loadingMore?: boolean;
  currentTab?: ADTab;
  loading?: boolean;
  loadingComponent?: boolean;
  hasNextTabs?: boolean;
  records?: IRecord[];
  snackbarMessage?: string;
  showSnackbar?: boolean;
  snackbarColor?: string;
  snackbarActionColor?: string;
  cardFABShowing?: boolean;
  hasNewRecord?: boolean;
  multipleSelectionMode?: boolean;
  newRecordFABShowing?: boolean;
  pageSize?: number;
  refreshing?: boolean;
  noResultsFromLastPage?: boolean;
  filters?: FilterValue[];
  level?: number;
  tabContextValue: TabContextValue;
  lastScrollPosition: number;
  loadingOlder: boolean;
}

class Tab extends React.Component<Props, State> {
  listRef: object;
  searchRef: TabSearchBar;
  singleView: boolean;
  currentRecord: IRecord;
  static contextType = ScreenContext;
  MAX_RECORDS = 10;

  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: null,
      records: [],
      loading: true,
      snackbarMessage: "",
      showSnackbar: false,
      snackbarColor: Colors.black,
      snackbarActionColor: Colors.white,
      hasNextTabs: false,
      cardFABShowing: false,
      hasNewRecord: false,
      multipleSelectionMode: false,
      newRecordFABShowing: true,
      pageOffset: 0,
      pageSize: 10,
      refreshing: false,
      loadingMore: false,
      noResultsFromLastPage: false,
      filters: [],
      loadingComponent: true,
      tabContextValue: this.initializeTabContextValue(),
      lastScrollPosition: 0,
      loadingOlder: false
    };

    this.listRef = null;
    this.searchRef = null;
    this.singleView = !!props.currentRecordId;
  }

  initializeTabContextValue = () => {
    return {
      onSave: this.onSave,
      currentRecord: null,
      setCurrentRecord: this.setCurrentRecord
    };
  };

  setCurrentRecord = (record: IRecord) => {
    const recordIndex = this.state.records.indexOf(record);
    if (recordIndex !== -1) {
      const updatedRecords = [...this.state.records];
      updatedRecords[recordIndex] = record;
      this.setState({ records: updatedRecords });
    }
  };

  async componentDidMount() {
    this.setState({ loading: true });
    await this.reload(this.props.parentRecordId);

    if (!this.context.currentRecord) {
      this.context.eventSubscribe(APP_EVENT, NEW_RECORD, newRecord => {
        console.log("Event propagated");
        this.setState(prevState => ({
          records: [newRecord, ...prevState.records]
        }));
      });
    }
  }

  componentWillUnmount() {
    this.setState({ records: [], level: 0 });
  }

  async reload(parentRecordId: string) {
    const loadingState =
      this.state.pageOffset > 0 ? { loadingMore: true } : { loading: true };
    this.setState(loadingState);

    let records = [];
    let noResultsFromLastPage = false;

    try {
      // check for next level tabs
      const currentTab = Windows.getTab(
        this.context.windowId,
        parseInt(this.props.entityType.sequenceNumber),
        this.props.entityType.level
      ) as ADTab;
      this.setState({ currentTab });

      // obtain data
      if (!this.props.entityType) {
        this.setState({ records: [] });
      } else {
        const context = this.props.context || {};
        if (this.context.currentEntity) {
          this.setState({ records: [this.context.currentEntity] });
        } else {
          const currentRecords = await OBDal.tabRecords(
            this.props.entityType,
            this.props.isSalesTransaction,
            currentTab,
            parentRecordId,
            context,
            this.props.currentRecordId,
            this.props.entityType.entityName,
            this.state.filters,
            this.state.pageOffset,
            this.state.pageSize
          );

          const existingIds = new Set(
            this.state.records.map(record => record.id)
          );
          const newRecords = currentRecords.filter(
            record => !existingIds.has(record.id)
          );

          records = [...this.state.records, ...newRecords];

          noResultsFromLastPage = currentRecords.length === 0;
        }
      }
    } catch (error) {
      this.props.showSnackbar(`${error.message}`, true);
    } finally {
      this.setState({
        records:
          records.length > this.MAX_RECORDS
            ? records.slice(records.length - this.MAX_RECORDS)
            : records,
        noResultsFromLastPage,
        loading: false,
        loadingMore: false,
        refreshing: false,
        loadingOlder: false
      });
    }
  }

  loadMore = () => {
    if (
      this.state.noResultsFromLastPage ||
      this.state.refreshing ||
      this.state.loading ||
      this.state.loadingMore
    ) {
      return;
    }

    this.setState(
      state => ({
        pageOffset: state.pageOffset + state.pageSize
      }),
      () => this.reload(this.props.parentRecordId)
    );
  };

  loadOlderRecords = () => {
    if (
      this.state.noResultsFromLastPage ||
      this.state.refreshing ||
      this.state.loading ||
      this.state.loadingMore
    ) {
      return;
    }

    this.setState(
      {
        pageOffset: Math.max(0, this.state.pageOffset - this.state.pageSize),
        loadingOlder: true
      },
      () => this.reload(this.props.parentRecordId)
    );
  };

  handleScroll = event => {
    const currentScrollPosition = event.nativeEvent.contentOffset.y;

    const isScrollingUp = currentScrollPosition == 0;

    if (isScrollingUp) {
      this.loadOlderRecords();
    } else {
      this.loadMore();
    }

    this.setState({ lastScrollPosition: currentScrollPosition });
  };

  showFAB = (id, context) => {
    this.setState({ cardFABShowing: true });
    this.hideNewRecordFAB();
    this.props.showFAB(id, context);
  };

  hideFAB = () => {
    this.setState({ cardFABShowing: false });
    this.showNewRecordFAB();
    this.props.hideFAB();
  };

  showNewRecordFAB = () => {
    this.setState({ newRecordFABShowing: true });
  };

  hideNewRecordFAB = () => {
    this.setState({ newRecordFABShowing: false });
  };

  onDeleteRecord = async record => {
    try {
      const response: any = await OBRest.getInstance().remove(record);

      if (
        response.error ||
        (response.data &&
          response.data.response &&
          response.data.response.error)
      ) {
        throw new Error(
          response.error?.message || response.data.response.error.message
        );
      }

      this.setState({
        records: this.state.records.filter(r => r.id != record.id)
      });
      this.props.showSnackbar(locale.t("Tab:RecordDeleted"));
    } catch (error) {
      this.props.showSnackbar(`${error.message}`, true);
    }
  };

  onDeleteSelected = async () => {
    try {
      const response: any = await OBRest.getInstance().removeList(
        this.context.selectedRecords
      );

      // Handle errors when deleting multiple
      // This one in case any fails but none is deleted.
      if (
        response.error ||
        (response.data &&
          response.data.response &&
          response.data.response.error)
      ) {
        throw new Error(
          response.error?.message || response.data.response.error.message
        );
      }

      // This in case there is an error found in some deletion but others are deleted.
      response.forEach(res => {
        if (res.error || (res.data && res.data.res && res.data.res.error)) {
          throw new Error(
            res.error?.message || res.data.response.error.message
          );
        }
      });

      const deleted = this.context.selectedRecords.length;
      const newRecords = this.state.records.filter(
        record => !this.context.selectedRecords.includes(record)
      );
      this.context.selectedRecords.length = 0;
      this.setState({ records: newRecords });
      this.toggleMultipleSelectionMode();
      this.props.showSnackbar(locale.t("Tab:RecordsDeleted", { qty: deleted }));
    } catch (error) {
      ErrorHelper.handleError(ERROR_TYPE.REMOVE_LIST, error);
      this.props.showSnackbar(`${error.message}`, true);
    }
  };

  onSave: onSaveFunc = async newState => {
    const localState = { ...newState } as {
      [x: string]: any;
      _entityName: string;
    };
    localState._entityName = this.props.entityType.entityName;
    if (localState.rightIcon) delete localState.rightIcon;
    if (localState.showSnackBar) delete localState.showSnackBar;
    if (localState.recordEdited) delete localState.recordEdited;
    if (localState.open) delete localState.open;
    // if (!this.props.entityType) {
    //   return;
    // }
    try {
      // TODO Fix object type
      // @ts-ignore
      const updatedRecord = await RecordService.onSave(localState);

      /*
      // @ts-ignore
      const newRecord = await OBRest.getInstance().save(localState)
      // Update state with response from server, to fill identifiers and such
      this.setState({records: props.records, hasNewRecord: props.hasNewRecord})
      this.props.showSnackbar(locale.t('CardView:RecordSaved'));
      */
      if (this.props.onRecordSaved) {
        this.props.onRecordSaved(updatedRecord);
      }
      return updatedRecord;
    } catch (error) {
      ErrorHelper.handleError(ERROR_TYPE.SAVE, error);
      this.props.showSnackbar(`${error.message}`, true);
      throw error;
    }
  };

  onNewRecord = () => {
    let newRecord = {
      isNew: true,
      _identifier: locale.t("Tab:NewRecordIdentifier")
    };

    this.loadDefaultValues(0, newRecord)
      .then(newRecord => {
        const cardData = new CardDataParams({
          label: this.props.title,
          isSalesTransaction: this.props.isSalesTransaction,
          windowId: this.context.windowId,
          windowName: this.props.windowName,
          entitiesByLevel: this.context.entitiesByLevel,
          tabLevel: this.props.entityType.level,
          tabIndex: this.props.tabIndex,
          currentRecordId: NEW_RECORD,
          currentRecord: newRecord,
          fields: this.loadFields(newRecord)
        });
        this.props.navigation.push(cardData.windowId, cardData);
      })
      .catch(error => {
        this.props.showSnackbar(`${error.message}`, true);
      });
  };

  onCancelNewRecord = () => {
    this.setState({
      hasNewRecord: false,
      records: this.state.records.filter(record => !record.isNew)
    });
  };

  onChangeSearchFilters = (filters: FilterValue[]) => {
    this.setState(
      { noResultsFromLastPage: false, pageOffset: 0, records: [], filters },
      () => {
        this.reload(this.props.parentRecordId);
      }
    );
  };

  toggleMultipleSelectionMode = (record?) => {
    if (this.state.multipleSelectionMode) {
      this.selectRecord();
    } else {
      this.selectRecord(record);
    }
    this.props.changeAppbarMode(!this.state.multipleSelectionMode);
    this.setState({ multipleSelectionMode: !this.state.multipleSelectionMode });
  };

  selectRecord = (record?) => {
    if (record) {
      const selectedIndex = this.context.selectedRecords.findIndex(
        selected => selected.id === record.id
      );
      if (selectedIndex != -1) {
        this.context.selectedRecords.splice(selectedIndex, 1);
      } else {
        this.context.selectedRecords.push(record);
      }
      if (this.context.selectedRecords.length === 0) {
        this.setState({ multipleSelectionMode: false });
        this.props.changeAppbarMode(false);
      }
      this.props.updateSelectedRecordAmount(
        this.context.selectedRecords.length
      );
    } else {
      this.props.updateSelectedRecordAmount(0);
      this.context.selectedRecords.length = 0;
    }
  };

  getSelectedAmount = () => {
    return this.context.selectedRecords.length;
  };

  getRecordContext: IGetContextFunction = (fields, record) => {
    const context = {
      windowId: this.context.windowId,
      tabId: this.state.currentTab.id
    };

    Object.keys(fields).forEach(key => {
      const columnName = fields[key].inpName;
      if (record[key]) {
        context["inp" + columnName] = record[key];
      }
    });

    return context;
  };

  loadDefaultValues = async (index, record) => {
    const fullContext = {
      ...this.getRecordContext(this.state.currentTab.fields, record)
    };
    let parentRecordId = this.props.parentRecordId;
    let parentEntity = this.props.parentEntity;

    if (this.props.entityType.level > 0) {
      const parentRecordKey = Object.keys(this.state.currentTab.fields).find(
        key => this.state.currentTab.fields[key].isParentRecordProperty
      );
      if (!parentRecordKey) {
        this.props.showSnackbar(locale.t("Tab:RSQL_ParentRecordUnknown"), true);
        return;
      }
    }

    let newRecord = null;
    try {
      const result = await OBRest.getInstance().callWebService(
        `com.smf.mobile.utils.FormValuesService?tabId=${
          this.state.currentTab.id
        }${
          parentRecordId
            ? `&parentId=${parentRecordId}&parentEntity=${parentEntity}`
            : ""
        }`,
        "POST",
        [],
        { context: fullContext }
      );
      if (result.data) {
        newRecord = result.data;
      } else {
        console.error(result);
        throw new Error(result.message);
      }
      return newRecord;
    } catch (error) {
      ErrorHelper.handleError(ERROR_TYPE.DEFAULT_VALUES, error);
      throw error;
    }
  };

  getFieldValue = (searchType, searchKey, fields, record) => {
    let result = null;
    switch (searchType) {
      case "inpName":
        Object.keys(fields).some(key => {
          const field = fields[key];
          if (field.inpName === searchKey) {
            result = record[key];
            return true; // break
          }
        });
        break;

      default:
        result = record[searchKey];
        break;
    }

    return result;
  };

  renderTabItem = ({ item, index }) => {
    return (
      <TabContext.Provider
        value={{
          onSave: this.onSave,
          currentRecord: item,
          setCurrentRecord: (record: IRecord) => {
            this.state.records[this.state.records.indexOf(item)] = record;
            this.setState({ records: this.state.records });
          },
          identifiers: this.state.currentTab.identifiers,
          loadFields: this.loadFields,
          entitiesByLevel: this.context.entitiesByLevel,
          windowId: this.context.windowId,
          windowName: this.props.windowName,
          tabLevel: this.props.entityType.level,
          tabSequence: parseInt(this.props.entityType.sequenceNumber),
          tabIndex: this.props.tabIndex,
          entityType: this.props.entityType,
          isSalesTransaction: this.props.isSalesTransaction,
          fields: this.state.currentTab.fields,
          eventSubscribe: this.context.eventSubscribe,
          eventUnsubscribe: this.context.eventUnsubscribe,
          eventEmitter: this.context.eventEmitter,
          showSnackbar: this.props.showSnackbar,
          getRecordContext: this.getRecordContext,
          selectedRecords: this.context.selectedRecords,
          selectRecords: this.selectRecord,
          onLongPress: this.toggleMultipleSelectionMode,
          multipleSelectionMode: this.state.multipleSelectionMode,
          fabActions: this.context.fabActions
        }}
      >
        <MemoizedSwipeableCard
          snapPointsRight={this.state.hasNextTabs ? [130] : [0]}
          snapPointsLeft={!item.isNew ? [130] : [0]}
          icon={"file-document"}
          iconSelected={"check"}
          tabId={this.state.currentTab.id}
          tabUIPattern={this.state.currentTab.uIPattern}
          windowId={this.context.windowId}
          entityType={this.props.entityType}
          recordIndex={index}
          multipleSelectionMode={this.state.multipleSelectionMode}
          onSelectCard={this.selectRecord}
          showFAB={this.showFAB}
          hideFAB={this.hideFAB}
          reloadWindow={this.props.reloadWindow}
          onDeleteRecord={this.onDeleteRecord}
          navigation={this.props.navigation}
          currentRecordId={this.props.currentRecordId}
          currentRecord={item}
          onCardNavigate={this.onCardNavigation}
        />
      </TabContext.Provider>
    );
  };

  renderSearchbar = () => {
    if (this.singleView) {
      return null;
    } else {
      if (!this.state.multipleSelectionMode) {
        return (
          <TabContext.Provider
            value={{
              getRecordContext: this.getRecordContext,
              showSnackbar: this.context.showSnackbar
            }}
          >
            <View style={styles.searchBar}>
              <TabSearchBar
                key={"tab-" + this.state.currentTab.id}
                ref={ref => (this.searchRef = ref)}
                filters={this.state.filters}
                onChangeFilters={this.onChangeSearchFilters}
                identifiers={this.state.currentTab.identifiers}
                fields={this.state.currentTab.fields}
                tabId={this.state.currentTab.id}
              />
            </View>
          </TabContext.Provider>
        );
      } else {
        return null;
      }
    }
  };

  onEntityUpdated = entity => {
    console.log("setCurrentEntity");
    console.log(entity);
  };

  onCardNavigation: OnCardNavigation = (
    windowId: string,
    cardData: CardDataParams
  ) => {
    let currentRecord = this.state.records.find(
      entity => entity?.id === cardData.currentRecordId
    ) as IRecord;
    console.log("onCardNavigation");
    console.log(this.state.records.indexOf(currentRecord));
    cardData.currentRecord = currentRecord;
    this.props.navigation.push(cardData.windowId, cardData);
  };

  loadFields: ILoadFieldsFunction = (record: IRecord) => {
    const { fields, identifiers } = this.state.currentTab;

    const state = {
      isNew: !record.id,
      id: record.id,
      title: record["_identifier"],
      subtitle: null,
      displayedIdentifiers: null
    };
    let displayedIdentifiers = [];

    Object.keys(fields).forEach(key => {
      let fieldValue = record[key];

      state[key] = record[key];
      if (record[key + obIdentifierKey]) {
        state[key + obIdentifierKey] = record[key + obIdentifierKey];
        fieldValue = record[key + obIdentifierKey];
      }

      if (fields[key].column["reference" + obIdentifierKey] == "List") {
        // Special case for AD Reference List
        fieldValue = fields[key].refList.find(i => i.value === fieldValue)
          ?.label;
      }

      let displayedIdentifier = identifiers?.find(
        identifier => identifier.field === fields[key].id
      );
      if (displayedIdentifier) {
        displayedIdentifiers.push(
          new DisplayedIdentifiers(
            displayedIdentifier.id,
            fields[key].name,
            fieldValue,
            displayedIdentifier.sequenceNumber
          )
        );
      }
    });

    displayedIdentifiers.sort((a, b) => a.seqno - b.seqno);

    if (displayedIdentifiers.length > 0) {
      state.title = displayedIdentifiers[0].value;
      state.subtitle = displayedIdentifiers[0].name;
    }
    state.displayedIdentifiers = displayedIdentifiers;
    return state;
  };

  render() {
    if (!this.state.currentTab) {
      return null;
    }

    return (
      <>
        {this.context.currentRecord && (
          <TabContext.Provider
            value={{
              onSave: this.onSave,
              currentTab: this.state.currentTab,
              currentRecord: this.context.currentRecord,
              identifiers: this.state.currentTab.identifiers,
              loadFields: this.loadFields,
              entitiesByLevel: this.context.entitiesByLevel,
              windowId: this.context.windowId,
              windowName: this.props.windowName,
              tabLevel: this.props.entityType.level,
              tabSequence: parseInt(this.props.entityType.sequenceNumber),
              tabIndex: this.props.tabIndex,
              entityType: this.props.entityType,
              isSalesTransaction: this.props.isSalesTransaction,
              fields: this.state.currentTab.fields,
              eventSubscribe: this.context.eventSubscribe,
              eventUnsubscribe: this.context.eventUnsubscribe,
              eventEmitter: this.context.eventEmitter,
              loadDefaultValues: this.loadDefaultValues,
              showSnackbar: this.props.showSnackbar,
              getRecordContext: this.getRecordContext,
              selectedRecords: this.context.selectedRecords,
              selectRecords: this.selectRecord,
              onLongPress: this.toggleMultipleSelectionMode,
              multipleSelectionMode: this.state.multipleSelectionMode,
              fabActions: this.context.fabActions
            }}
          >
            <RecordTabView navigation={this.props.navigation} />
          </TabContext.Provider>
        )}
        {!this.context.currentRecord && (
          <>
            {this.renderSearchbar()}
            {this.state.loading && (
              <>
                <Placeholder
                  Animation={Fade}
                  Left={PlaceholderMedia}
                  style={{
                    paddingTop: 20,
                    paddingLeft: 20,
                    paddingRight: 25,
                    marginBottom: 20
                  }}
                >
                  <PlaceholderLine />
                  <PlaceholderLine />
                  <PlaceholderLine />
                </Placeholder>
                <Placeholder
                  Animation={Fade}
                  Left={PlaceholderMedia}
                  style={{
                    paddingTop: 20,
                    paddingLeft: 20,
                    paddingRight: 25,
                    marginBottom: 20
                  }}
                >
                  <PlaceholderLine />
                  <PlaceholderLine />
                  <PlaceholderLine />
                </Placeholder>
                <Placeholder
                  Animation={Fade}
                  Left={PlaceholderMedia}
                  style={{
                    paddingTop: 20,
                    paddingLeft: 20,
                    paddingRight: 25,
                    marginBottom: 20
                  }}
                >
                  <PlaceholderLine />
                  <PlaceholderLine />
                  <PlaceholderLine />
                </Placeholder>
              </>
            )}
            <FlatList
              ref={ref => (this.listRef = ref)}
              data={this.state.records}
              onMomentumScrollEnd={this.handleScroll}
              onEndReachedThreshold={0.5}
              keyExtractor={item => item.id}
              renderItem={this.renderTabItem}
              ListHeaderComponent={() => {
                if (this.state.loadingOlder) {
                  return (
                    <ActivityIndicator
                      animating={this.state.loadingOlder}
                      style={{ paddingTop: 24 }}
                    />
                  );
                }
                return;
              }}
              ListFooterComponent={() => (
                <ActivityIndicator
                  animating={this.state.loadingMore}
                  style={{ paddingVertical: 8 }}
                />
              )}
            />
            <FAB
              style={styles.fabutton}
              icon={"plus"}
              onPress={this.onNewRecord}
              visible={
                this.state.currentTab.uIPattern === UI_PATTERNS.STD &&
                this.state.newRecordFABShowing &&
                !this.state.multipleSelectionMode &&
                !(this.state.loading || this.state.refreshing)
              }
            />
          </>
        )}
      </>
    );
  }
}

export default withTheme(Tab);
export { Tab as TabType };

const styles = StyleSheet.create({
  fabutton: {
    position: "absolute",
    margin: 34,
    right: 0,
    bottom: 34,
    backgroundColor: defaultTheme.colors.primary
  },
  searchBar: {
    width: "100%"
  }
});
