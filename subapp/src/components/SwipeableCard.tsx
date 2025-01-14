import React from "react";
import Card, { IGetContextFunction } from "./Card";
import SwipeableItem from "react-native-swipeable-item";
import { View, StyleSheet } from "react-native";
import { Button, withTheme } from "react-native-paper";
import locale from "../i18n/locale";
import { IField } from "./Field";
import { defaultTheme, ITheme } from "../themes";
import { OnCardNavigation } from "./record/RecordForm";
import { IOBDalEntity } from "../ob-api/classes/OBDal";
import { ReloadFunction } from "../screens/CardView";
import TabContext from "../contexts/TabContext";
import { UI_PATTERNS } from "../ob-api/constants/uiPatterns";

export interface IEntity {
  entityName: string;
}
interface Props extends ITheme {
  currentRecordId?: string;
  currentRecord?: any;
  //record?: IRecord
  fields?: IField[];
  entityType?: IOBDalEntity;
  //entitiesByLevel: IOBDalEntity[]
  windowId?: string;
  tabLevel?: number;
  tabId?: string;
  tabUIPattern?: string;
  tabIndex?: any;
  reloadWindow?: ReloadFunction;
  onDeleteRecord?: any;
  title?: string;
  subtitle?: string;
  multipleSelectionMode?: boolean;
  renderUnderlayRight?: any;
  snapPointsRight?: any;
  snapPointsLeft?: any;
  renderUnderlayLeft?: any;
  //onSave: onSaveFunc
  onLongPress?: any;
  //identifiers?: any
  icon?: any;
  iconSelected?: any;
  recordIndex?: any;
  //selectedRecords?: any
  onSelectCard?: any;
  showFAB?: any;
  hideFAB?: any;
  showSnackbar?: any;
  loadDefaultValues?: any;
  getContext?: IGetContextFunction;
  navigation?: any;
  breadcrumbs?: any;
  onCardNavigate: OnCardNavigation;
}

interface State {}
class SwipeableCard extends React.Component<Props, State> {
  singleView: boolean;

  static contextType = TabContext;

  constructor(props) {
    super(props);
    this.singleView = !!props.currentRecordId;
  }

  componentDidMount() {}

  renderUnderlayLeft = () => {
    return (
      <Button
        mode="contained"
        color={defaultTheme.colors.error}
        style={styles.swipeStyle}
        labelStyle={styles.label}
        onPress={() => this.props.onDeleteRecord(this.context.currentRecord)}
      >
        {locale.t("Tab:DeleteRecord")}
      </Button>
    );
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.title != nextProps.title) {
      return true;
    }
    if (this.props.subtitle != nextProps.subtitle) {
      return true;
    }
    /*
    if (this.currentRecord != nextProps.record) {
      return true
    }
     */
    return this.props.multipleSelectionMode != nextProps.multipleSelectionMode;
  }

  render() {
    if (
      this.props.tabUIPattern === UI_PATTERNS.STD ||
      this.props.tabUIPattern === UI_PATTERNS.ED
    ) {
      return (
        <View>
          <SwipeableItem
            snapPointsRight={this.props.snapPointsRight}
            snapPointsLeft={this.props.snapPointsLeft}
            renderUnderlayLeft={
              this.props.renderUnderlayLeft
                ? this.props.renderUnderlayLeft
                : this.renderUnderlayLeft
            }
            item={null}
          >
            <Card {...this.props} />
          </SwipeableItem>
        </View>
      );
    } else {
      return (
        <View>
          <Card {...this.props} />
        </View>
      );
    }
  }
}

export default withTheme(SwipeableCard);

const styles = StyleSheet.create({
  swipeStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 20,
  },
  label: {
    marginHorizontal: 40
  }
});
