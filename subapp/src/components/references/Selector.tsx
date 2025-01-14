import React from "react";
import { Button, Divider, List, Surface } from "react-native-paper";
import {
  FlatList,
  TouchableWithoutFeedbackBase,
  View,
  Text
} from "react-native";
import Modal, { ModalProps, ModalState } from "./Modal";
import locale from "../../i18n/locale";
import { observer } from "mobx-react";
import OBDatasource from "../../ob-api/classes/OBDatasource";
import FormContext from "../../contexts/FormContext";
import Searchbar from "../tabSearchBar/Searchbar";

export interface SelectorProps extends ModalProps {
  // TODO Selector type
  selector?: any;
  searchBarPlaceholder?: string;
  valueKey?: string;
}

interface State extends ModalState {
  query: string;
  searchResults: {
    _identifier: string;
    id: string;
  }[];
  dataFromServer: boolean;
  loading: boolean;
  noResultsFromLastPage: boolean;
  identifier: string;
  noResults: boolean;
}

@observer
export default class Selector extends Modal<SelectorProps, State> {
  static contextType = FormContext;
  offset: number;
  pageSize: number;

  constructor(props) {
    super(props);
    this.state = {
      query: null,
      searchResults: [],
      loading: false,
      dataFromServer: false,
      noResultsFromLastPage: false,
      showPickerModal: false,
      identifier: props.identifier,
      noResults: false
    };
    this.offset = 0;
    this.pageSize = 7;
  }

  componentDidUpdate = prev => {
    if (prev.identifier !== this.props.identifier) {
      this.setState({ identifier: this.props.identifier });
    }
  };

  onShow = () => {
    this.setState({ query: null });
    this.setState({ noResultsFromLastPage: false, noResults: false });
    this.offset = 0;
    if (this.props.value) {
      this.setState({
        dataFromServer: false,
        searchResults: [
          {
            id: this.props.value,
            [this.props.selector.valueField]: this.props.value,
            _identifier: this.props.identifier
          }
        ]
      });
    }
  };

  changeQueryText = query => {
    if (query === "") {
      // Do this in case the clear button is pressed, since that does not raise a onSubmitEditing
      this.setState({ searchResults: [] });
    }
    this.setState({ query });
  };

  query = async (query, start, limit) => {
    this.setState({ loading: true });

    try {
      if (start === 0 && this.state.searchResults.length > 0) {
        // Reset search results when searching from text box
        this.setState({ searchResults: [] });
      }

      const request = { ...this.props.selector };

      request._currentValue = this.props.value;
      request._OrExpression = true; // Until we support selector pop up grids
      request._noCount = false;

      if (query) {
        request.operator = "or";
        request._constructor = "AdvancedCriteria";
        request.criteria = [];

        let operator;
        if (request._textMatchStyle === "substring") {
          operator = "iContains";
        } else {
          operator = "iStartsWith";
        }

        let extraSearchFields = [];
        if (this.props.selector.extraSearchFields) {
          extraSearchFields = this.props.selector.extraSearchFields.split(",");
        }

        for (let i = 0; i < extraSearchFields.length; i++) {
          request.criteria.push({
            fieldName: extraSearchFields[i],
            operator: operator,
            value: query.trim()
          });
        }
        request.criteria.push({
          fieldName: this.props.selector.displayField,
          operator: operator,
          value: query.trim()
        });
      }

      request._startRow = start;
      request._endRow = limit;

      // context is useful for selectors that may depend on other field's values
      request.context = this.context.getRecordContext(
        this.context.fields,
        this.context.currentRecord
      );

      const response = await OBDatasource.fetch(
        request,
        this.props.referenceKey
      );

      if (response.data) {
        if (start > 0 && response.data && response.data.length > 0) {
          this.setState({
            searchResults: [...this.state.searchResults, ...response.data],
            dataFromServer: true,
            noResultsFromLastPage:
              response.data.length + this.state.searchResults.length < limit
          });
        } else if (start > 0 && response.data && response.data.length === 0) {
          this.setState({ noResultsFromLastPage: true });
        } else if (
          response.data &&
          (this.state.searchResults.length === 0 ||
            (this.state.searchResults.length > 0 && !this.state.dataFromServer))
        ) {
          this.setState({
            searchResults: response.data,
            dataFromServer: true,
            noResultsFromLastPage: response.data.length < limit
          });
        }
      } else {
        this.setState({ searchResults: [] });
        this.setState({ noResults: true });
      }
    } catch (error) {
      this.setState({ searchResults: [] });
      this.setState({ noResults: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  onPressListItem = (newValue, valueKey, identifier) => {
    this.context.onChangeSelectorItem(
      this.props.field,
      newValue,
      valueKey,
      identifier
    );
    this.setState({ searchResults: [], showPickerModal: false, identifier });
  };

  renderLabel = () => {
    return this.state.identifier;
  };

  renderDialogContent = () => {
    return (
      <View>
        <Searchbar
          style={{ elevation: 1 }}
          placeholder={
            this.props.searchBarPlaceholder ||
            locale.t("Selector:SearchPlaceholder")
          }
          onChangeText={this.changeQueryText}
          onSubmitEditing={({ nativeEvent }) =>
            this.query(nativeEvent.text, 0, this.pageSize)
          }
          onIconPress={() => this.query(this.state.query, 0, this.pageSize)}
          value={this.state.query}
        />
        <View style={{ marginTop: 8 }}>
          {this.state.noResults === false ? (
            <Surface style={{ elevation: 1 }}>
              <FlatList
                style={{ maxHeight: 400, flexGrow: 0 }}
                data={this.state.searchResults}
                refreshing={this.state.loading}
                initialNumToRender={this.pageSize}
                renderItem={({ item }) => (
                  <List.Item
                    title={
                      item[this.props.selector.displayField] ||
                      item._identifier ||
                      item.id
                    }
                    onPress={() =>
                      this.onPressListItem(
                        item[this.props.selector.valueField],
                        this.props.valueKey,
                        item[this.props.selector.displayField] ||
                          item._identifier ||
                          item.id
                      )
                    }
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                keyExtractor={(item, index) => `listItem-${index}-${item.id}`}
              />
            </Surface>
          ) : (
            <Text style={{ textAlign: "center" }}>{locale.t("NoResult")}</Text>
          )}

          {this.state.searchResults.length > 0 &&
            this.state.dataFromServer &&
            !this.state.noResultsFromLastPage && (
              <Button
                style={{ marginTop: 8 }}
                loading={this.state.loading}
                onPress={() => {
                  if (this.state.loading) {
                    return;
                  }
                  this.offset += this.pageSize + 1;
                  return this.query(
                    this.state.query,
                    this.offset,
                    this.offset + this.pageSize
                  );
                }}
              >
                {locale.t("Selector:LoadMore")}
              </Button>
            )}
        </View>
      </View>
    );
  };
}
