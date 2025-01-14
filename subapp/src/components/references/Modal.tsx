import React from "react";
import { Dialog, Button, Portal } from "react-native-paper";
import {
  Modal as RNModal,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet
} from "react-native";
import Field, { FieldProps, FieldState, FieldMode } from "../Field";
import locale from "../../i18n/locale";
import { componentsStyle, defaultTheme } from "../../themes";
import Icon from "react-native-vector-icons/FontAwesome";
import { UI_PATTERNS } from "../../ob-api/constants/uiPatterns";

export interface ModalProps extends FieldProps {
  identifier?: string;
  value?: string;
  isNewRecord?: boolean;
}

export interface ModalState extends FieldState {
  showPickerModal?: boolean;
  loading: boolean;
}

export default abstract class Modal<
  P extends ModalProps,
  S extends ModalState
> extends Field<P, S> {
  protected constructor(props) {
    super(props);
    this.state = { showPickerModal: false, loading: false } as S;
  }

  abstract renderDialogContent: any;

  onComponentDidMount = () => {};

  onShow = () => {};

  onHide = (canceled?: boolean) => {};

  onDonePressed = async () => {};

  onChipSelected = (fieldId: string) => {
    this.setState({ showPickerModal: true });
    this.onShow();
  };

  renderLabel = () => {
    return this.props.identifier || this.props.value || null;
  };

  renderField = () => {
    const updatable = this.props.field.column
      ? this.props.field.column.updatable
      : true;
    const disabled =
      this.props.field.readOnly ||
      (!updatable && !this.props.isNewRecord) ||
      this.props.tabUIPattern == UI_PATTERNS.RO;
    const mode = this.props.mode || FieldMode.horizontal;
    return (
      <>
        {mode == FieldMode.horizontal && (
          <View style={styles.viewStyle}>
            <View style={{ width: "80%" }}>
              {this.renderLabel() && (
                <Text
                  allowFontScaling={false}
                  style={[styles.textStyle, componentsStyle.modalCallLabel]}
                  numberOfLines={1}
                >
                  {this.renderLabel()}
                </Text>
              )}
              {!this.renderLabel() && (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.textSelectStyle,
                    componentsStyle.modalCallLabel
                  ]}
                >
                  {locale.t("Reference:Select")}:
                </Text>
              )}
            </View>
            <View style={styles.viewToStyle}>
              <TouchableOpacity
                style={[
                  componentsStyle.modalCallButton,
                  { opacity: disabled ? 0.3 : 1 }
                ]}
                disabled={disabled}
                onPress={() => {
                  this.setState({ showPickerModal: true });
                  this.onShow();
                }}
              >
                <View style={styles.iconViewStyle}>
                  <Icon name="pencil" size={12} style={styles.iconStyle} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Portal>
          <Dialog
            visible={!!this.state.showPickerModal}
            onDismiss={() => {
              this.setState({ showPickerModal: false });
              this.onHide(true);
            }}
          >
            <Dialog.Title>
              {locale.t("Reference:SelectName", {
                name: this.props.field.name
              })}
            </Dialog.Title>
            <Dialog.Content>{this.renderDialogContent()}</Dialog.Content>
            <Dialog.Actions>
              <Button
                style={{
                  backgroundColor: defaultTheme.colors.accent,
                  marginRight: 20,
                  width: 120,
                  marginBottom: 20
                }}
                loading={this.state.loading}
                onPress={async () => {
                  await this.onDonePressed();
                  this.onHide(false);
                  this.setState({ showPickerModal: false });
                }}
              >
                {locale.t("Done")}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </>
    );
  };
}

const styles = StyleSheet.create({
  viewStyle: {
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
    justifyContent: "space-between",
    backgroundColor: defaultTheme.colors.background,
    height: 45,
    borderColor: defaultTheme.colors.greyborders,
    borderWidth: 1,
    borderRadius: 3,
    marginBottom: 10
  },
  textStyle: {
    marginLeft: 10,
    flexGrow: 1,
    flexShrink: 1,
    marginTop: Platform.OS === "ios" ? 10 : 0,
    fontSize: 15,
    width: "80%",
    alignSelf: "flex-start"
  },
  textSelectStyle: {
    marginLeft: 10,
    flexGrow: 1,
    color: defaultTheme.colors.greyaccent,
    marginTop: Platform.OS === "ios" ? 10 : 0,
    fontSize: 15
  },
  viewToStyle: {
    marginRight: 10,
    alignContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 0,
    backgroundColor: defaultTheme.colors.background
  },
  iconViewStyle: {
    flexDirection: "row",
    alignSelf: "center"
  },
  iconStyle: {
    flexShrink: 1,
    textAlignVertical: "center",
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 20
  },
  textIconStyle: {
    flexShrink: 1,
    paddingRight: 5
  }
});
