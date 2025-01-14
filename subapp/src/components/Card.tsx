//'use strict';
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  Card as PaperCard,
  Checkbox,
  withTheme,
  Paragraph,
  Title
} from "react-native-paper";
import CardContent from "./cardContent/CardContent";
import { IRecord } from "../types/Record";
import { defaultTheme, ITheme } from "../themes";
import { OnCardNavigation } from "./record/RecordForm";
import { CardDataParams } from "../types/CardDataParams";
import TabContext from "../contexts/TabContext";
import { APP_EVENT } from "../contexts/MainAppContext";
import { isTablet } from "../../hooks/IsTablet";

/**
 * Required props:
 *  fields
 *  record
 *  title
 * Optional props:
 *  onLongPress
 *  onSave
 *  subtitle
 *  icon
 */

interface ILoadDefaultValues {
  loadDefaultValues?(recordIndex: number, callback: () => void);
}
export interface IGetContextFunction {
  (fields: object, state: any): any;
}
interface IShowSnackbar {
  showSnackbar?();
}
interface IOnSelectedCard {
  onSelectCard?(record: IRecord);
}
interface IOnLongPress {
  onLongPress?(record: IRecord);
}

export interface INavigation {
  // TODO Change for navigation type in reactnavigation
  push(windowId: string, param: object);
  closeDrawer();
  navigate(name: string, params?: any);
  toggleDrawer();
  goBack();
}

export interface IIdentifiers {
  id: string;
  field: string;
  sequenceNumber: number;
}

interface Props
  extends ITheme,
    ILoadDefaultValues,
    IShowSnackbar,
    IOnSelectedCard,
    IOnLongPress {
  //record: IRecord
  recordIndex?: number;
  currentRecordId?: string;
  currentRecord: any;
  windowId?: string;
  windowName?: string;
  tabId?: string;
  isSalesTransaction?: boolean;
  fields?: object[];
  //identifiers?: IIdentifiers[]
  //selectedRecords?: string[]
  entities?: IRecord[];
  //entitiesByLevel: IOBDalEntity[]
  navigation?: INavigation;
  //onSave: onSaveFunc
  onCardNavigate: OnCardNavigation;
  getContext?: IGetContextFunction;
}

interface State {
  title?: string;
  subtitle?: string;
  open?: boolean;
  recordEdited?: boolean;
  readOnly?: boolean;
  rightIcon?: string;
  isNew?: boolean;
  displayedIdentifiers?: object[];
  isSalesTransaction?: boolean;
}

class Card extends React.Component<Props, State> {
  state = {
    title: null,
    subtitle: null,
    open: false,
    rightIcon: "chevron-down",
    recordEdited: false,
    readOnly: true,
    displayedIdentifiers: [],
    isSalesTransaction: null
  };
  singleView = false;
  static contextType = TabContext;
  navigate = false;

  constructor(props) {
    super(props);
    this.singleView = !!props.currentRecordId;
  }

  componentDidMount() {
    this.loadFields(this.context.currentRecord);
  }

  componentDidUpdate(prevProps) {
    /*
    if (prevProps.record != this.props.record) {
      this.loadFields(this.props.record)
    }
     */
  }

  componentWillUnmount() {
    this.context.eventUnsubscribe(APP_EVENT, this.props.currentRecordId);
  }

  loadFields = async record => {
    if (!record) return;
    const state = await this.context.loadFields(record);

    this.setState(state);
  };

  getRightIconProps = () => {
    if (this.context.multipleSelectionMode) {
      let checked = false;
      if (
        this.context.selectedRecords.findIndex(
          sr => sr.id === this.props.currentRecord.id
        ) != -1
      ) {
        checked = true;
      }
      return (
        <View style={styles.checkboxStyle}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            color={defaultTheme.colors.primary}
            onPress={() => {
              this.context.selectRecords(this.props.currentRecord);
            }}
          />
        </View>
      );
    }
  };
  render() {
    const eventSubscribe = this.context.eventSubscribe;
    const cardData = new CardDataParams({
      label: this.state.title,
      isSalesTransaction: this.state.isSalesTransaction,
      windowId: this.props.windowId,
      windowName: this.props.windowName,
      entitiesByLevel: this.context.entitiesByLevel,
      tabLevel: this.context.tabLevel,
      tabIndex: this.context.tabIndex,
      currentRecordId: this.context.currentRecord.id, // currentRecordId
      breadcrumbs: this.props.breadcrumbs
    });
    const onPress = () => {
      if (this.context.multipleSelectionMode) {
        this.context.selectRecords(this.props.currentRecord);
      } else {
        eventSubscribe(APP_EVENT, cardData.currentRecordId, newRecord => {
          console.log("Event propagated");
          this.loadFields(newRecord);
          this.context.setCurrentRecord(newRecord);
        });
        this.props.onCardNavigate(cardData.windowId, cardData);
      }
    };
    return (
      <View style={styles.cardsContainer}>
        <View style={styles.cardVerticalLine}></View>
        {!this.singleView && (
          <PaperCard
            style={styles.cardStyle}
            onLongPress={() => {
              this.context.onLongPress(this.props.currentRecord);
            }}
            onPress={onPress}
          >
            {isTablet() ? (
              <Paragraph></Paragraph>
            ) : (
                <PaperCard.Title
                  titleStyle={styles.subtitleStyle}
                  subtitleStyle={styles.titleStyle}
                  title={this.state.subtitle}
                  subtitle={this.state.title}
                  titleNumberOfLines={1}
                  subtitleNumberOfLines={1}
                  right={props => this.getRightIconProps(props)}
                  rightStyle={styles.rightStyle}
                />
            )}

            <PaperCard.Content style={styles.cardContent}>
              {isTablet() ? null : (
                <Paragraph style={styles.cardGreyLine}> </Paragraph>
              )}
              {isTablet() ? (
                <View style={{ width: "40%" }}>
                  <Paragraph numberOfLines={1} style={styles.subtitleStyle}>
                    {this.state.subtitle}
                  </Paragraph>
                  <Paragraph numberOfLines={2} style={styles.titleStyle}>
                    {this.state.title}
                  </Paragraph>
                </View>
              ) : null}
              <CardContent
                identifiers={this.state.displayedIdentifiers || []}
              />
            </PaperCard.Content>
          </PaperCard>
        )}
      </View>
    );
  }
}

export default withTheme(Card);

const styles = StyleSheet.create({
  cardsContainer: {
    marginTop: 20,
    width: "100%",
    height: "auto",
    alignSelf: "center",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center"
  },
  cardVerticalLine: {
    backgroundColor: defaultTheme.colors.accent,
    width: 15,
    marginRight: -5,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 0.5,
    borderColor: defaultTheme.colors.greyaccent,
    borderStyle: "solid",
    borderRightWidth: 0,
    margin: 0
  },
  cardStyle: {
    width: "89%",
    backgroundColor: defaultTheme.colors.background,
    marginLeft: 0,
    borderStyle: "solid",
    borderColor: defaultTheme.colors.greyaccent,
    borderWidth: 0.5,
    borderLeftWidth: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 8
  },
  cardGreyLine: {
    backgroundColor: defaultTheme.colors.greyaccent,
    height: 1,
    marginTop: 10,
    marginBottom: 12
  },
  titleStyle: {
    color: defaultTheme.colors.textSecondary,
    marginTop: 12,
    fontSize: 20,
    maxWidth: "96%"
  },
  subtitleStyle: {
    fontSize: 15
  },
  rightStyle: {
    marginRight: 8
  },
  checkboxStyle: {
    marginTop: 44
  },
  cardContent: {
    flexDirection: isTablet() ? "row" : "column"
  }
});
