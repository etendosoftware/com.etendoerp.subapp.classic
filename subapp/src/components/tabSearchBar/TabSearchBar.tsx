import * as React from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
  View,
  StyleSheet
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";
import FormContext, { FieldEvent } from "../../contexts/FormContext";
import locale from "../../i18n/locale";
import { FilterValue, Fields, Field } from "../../types";
import { IIdentifiers } from "../Card";
import { FieldMode } from "../Field";
import Reference from "../Reference";
import { obIdentifierKey } from "../Tab";
import Searchbar from "./Searchbar";
import Banner from "./Banner";
import TabContext from "../../contexts/TabContext";

export interface TabSearchBarProps {
  filters: FilterValue[];
  onChangeFilters: (filters: FilterValue[]) => void;
  identifiers?: IIdentifiers[];
  fields: Fields;
  tabId: string;
}

export interface TabSearchBarState {
  showFilters: boolean;
  filterValues: FilterValue[];
  searchQuery: string;
}

export default class TabSearchBar extends React.Component<
  TabSearchBarProps,
  TabSearchBarState
> {
  static contextType = TabContext;
  inputField: Pick<
    TextInput,
    "blur" | "focus" | "setNativeProps" | "isFocused" | "clear"
  > = null;

  constructor(props: TabSearchBarProps) {
    super(props);
    this.state = {
      showFilters: false,
      filterValues: this.props.filters || [],
      searchQuery: ""
    };
  }

  isFocused = () => {
    return this.inputField?.isFocused();
  };

  shouldDisplayFilters = () => {
    if (this.props.identifiers?.length > 1) {
      this.setState({ showFilters: true });
    }
  };

  shouldHideFilters = () => {
    if (this.state.filterValues.length === 0 && !this.isFocused()) {
      this.setState({ showFilters: false });
    }
  };

  storeFilter = (
    selectedChip: string,
    label: string,
    value: string,
    property: string,
    propertyType: string,
    displayedValue?: string
  ) => {
    if (!value || value === "") {
      return;
    }

    this.setState(previous => {
      const newFilterValues = previous.filterValues;
      if (
        !newFilterValues.find(
          filterValue => filterValue.id === selectedChip + value
        )
      ) {
        newFilterValues.unshift(
          new FilterValue(
            selectedChip,
            label,
            value,
            displayedValue || value,
            property,
            propertyType,
            false
          )
        );
      }
      return { ...previous, filterValues: newFilterValues };
    }, this.onChangeFilters);
  };

  clearFilter = (selectedChip: string, isSearchBar: boolean) => {
    this.setState(
      previous => {
        let newFilterValues = previous.filterValues;
        let newSearchQuery = previous.searchQuery;
        if (isSearchBar) {
          newFilterValues = previous.filterValues.filter(
            filterValue => !filterValue.isSearchBar
          );
          newSearchQuery = "";
        } else {
          newFilterValues = previous.filterValues.filter(
            filterValue => filterValue.id !== selectedChip
          );
        }
        return {
          ...previous,
          filterValues: newFilterValues,
          searchQuery: newSearchQuery
        };
      },
      () => {
        this.shouldHideFilters();
        this.onChangeFilters();
      }
    );
  };

  onChangeFilters = () => {
    if (this.props.onChangeFilters) {
      this.props.onChangeFilters(this.state.filterValues);
    }
  };

  onInputFocus = (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
    this.shouldDisplayFilters();
  };

  valueReceived: FieldEvent = (
    field: Field,
    value: string,
    key: string,
    identifier?: string
  ) => {
    this.storeFilter(
      field.id,
      field.name,
      value.toString(),
      field.columnName,
      field.column["reference" + obIdentifierKey],
      identifier
    );
  };

  inputValueReceived = (
    value: string | boolean,
    key: string,
    canceled: boolean
  ) => {
    if (!canceled) {
      const field = this.props.fields[key];
      let stringValue = value.toString();
      if (typeof value === "boolean") {
        stringValue = value ? locale.t("Yes") : locale.t("No");
      }
      this.storeFilter(
        field.id,
        field.name,
        value.toString(),
        field.columnName,
        field.column["reference" + obIdentifierKey],
        stringValue
      );
    }
  };

  onChangeSearchQuery = (query: string) => {
    const clearButtonPresed = query == "" && !this.isFocused();
    // When the clear button is pressed, it does not raise a onSubmitEditing, so we need to trigger an onChange manually
    this.setState({ searchQuery: query }, () =>
      clearButtonPresed ? this.onSubmitSearch(null, true) : null
    );
  };

  onSubmitSearch = (
    _?: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
    cleared?: boolean
  ) => {
    const { searchQuery } = this.state;
    const { identifiers } = this.props;

    if (searchQuery === "" && !cleared) return;

    let searchBarIdentifier = null;
    if (identifiers || identifiers.length > 0) {
      searchBarIdentifier = identifiers[0];
    }

    this.setState(previous => {
      const newFilterValues = previous.filterValues;
      const searchBarIdentifierIndex = newFilterValues.findIndex(
        value => value.isSearchBar
      );

      if (searchBarIdentifierIndex !== -1) {
        if (searchQuery == "") {
          newFilterValues.splice(searchBarIdentifierIndex, 1);
        } else {
          newFilterValues[searchBarIdentifierIndex].value = searchQuery;
          newFilterValues[
            searchBarIdentifierIndex
          ].displayedValue = searchQuery;
        }
      } else {
        if (searchBarIdentifier) {
          const fieldKey = Object.keys(this.props.fields).find(
            key => this.props.fields[key].id === searchBarIdentifier.field
          );
          const field = this.props.fields[fieldKey];
          newFilterValues.unshift(
            new FilterValue(
              searchBarIdentifier.field,
              field.name,
              searchQuery,
              searchQuery,
              field.columnName,
              field.column["reference" + obIdentifierKey],
              true
            )
          );
        } else {
          newFilterValues.unshift(
            new FilterValue(
              "_identifier",
              "_identifier",
              searchQuery,
              searchQuery,
              "_identifier",
              "_identifier",
              true
            )
          );
        }
      }

      return { ...previous, filterValues: newFilterValues };
    }, this.onChangeFilters);
  };

  getFieldValue = (searchType: string, searchKey: string) => {
    // Current attribute selector allows to create but not search & select.
    // We would need a standard selector for attributes to allow filtering when an identifier is of type attribute
    return null;
  };

  getContext = () => {
    // We don't have a current record to get context from when using the search,
    // so we only send the window and tab id
    return {
      windowId: this.context.windowId,
      tabId: this.props.tabId
    };
  };

  public render() {
    return (
      <View style={styles.barStyle}>
        <Searchbar
          ref={ref => (this.inputField = ref)}
          placeholder={locale.t("Tab:SearchPlaceholder")}
          onChangeText={this.onChangeSearchQuery}
          value={this.state.searchQuery}
          onSubmitEditing={this.onSubmitSearch}
          onIconPress={this.onSubmitSearch}
          onFocus={this.onInputFocus}
          onBlur={this.shouldHideFilters}
        />
        <Banner
          visible={this.state.showFilters}
          actions={[]}
          contentStyle={{ marginHorizontal: 20 }}
        >
          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {this.state.filterValues.map(filter => {
              return (
                <Chip
                  key={filter.id}
                  onClose={() =>
                    this.clearFilter(
                      filter.fieldID + filter.value,
                      filter.isSearchBar
                    )
                  }
                  style={{ marginRight: 8 }}
                  mode="outlined"
                  selected={true}
                >
                  {`${filter.label}: ${filter.displayedValue || filter.value}`}
                </Chip>
              );
            })}
            <FormContext.Provider
              value={{
                onChangeInput: this.valueReceived,
                onChangeSwitch: this.valueReceived,
                onChangePicker: this.valueReceived,
                onChangeSelectorItem: this.valueReceived,
                onChangeAttribute: this.valueReceived,
                onChangeDateTime: this.valueReceived,
                onHideInput: this.inputValueReceived,
                onHideSwitchModal: this.inputValueReceived,
                showSnackbar: this.context.showSnackbar,
                getRecordContext: this.getContext,
                fields: this.props.fields
              }}
            >
              {this.props.identifiers?.map((identifier, index) => {
                const { fields } = this.props;
                const fieldKey = Object.keys(fields).find(
                  key => fields[key].id === identifier.field
                );
                if (fieldKey && index !== 0) {
                  const field = fields[fieldKey];
                  // The actual search bar will filter by the first identifier always
                  return (
                    <Reference
                      mode={FieldMode.chip}
                      inputMode={FieldMode.chip}
                      key={`ref-${field.id}`}
                      referenceKey={field.column.reference}
                      field={field}
                      valueKey={fieldKey}
                      isNewRecord={false}
                      pickerItems={field.refList}
                      selector={field.selector}
                      tabUIPattern={this.context?.currentTab?.uIPattern}
                    />
                  );
                }
              })}
            </FormContext.Provider>
          </ScrollView>
        </Banner>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  barStyle: {
    display: "flex",
    flexDirection: "column",
    marginTop: 13,
    alignSelf: "center",
    width: "90%"
  }
});
