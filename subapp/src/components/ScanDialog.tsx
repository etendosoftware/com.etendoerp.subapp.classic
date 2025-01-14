import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  TouchableOpacity
} from "react-native";
import locale from "../i18n/locale";
import ProcessDialog, {
  ProcessDialogProps,
  ProcessDialogState
} from "./ProcessDialog";
import { ActivityIndicator, Button } from "react-native-paper";
import Reference from "./Reference";
import { observer } from "mobx-react";
import { Snackbar } from "../globals";
import FormContext from "../contexts/FormContext";
import { Field } from "../types";
import { defaultTheme } from "../themes";
import Icon from "react-native-vector-icons/AntDesign";
import CameraBarCode from "./CameraBarCode";
import imgCodeScan from "../img/codescan01.png";

const BARCODE_ITEM_GROUPER = "970DB3D1F4EF48D88E075E326FF1FEAA";
const BARCODE_ITEM = "5F24FF437D0247818651652909BF4BEB";
const BARCODE_ITEM_QTY = "72BA798C160448599E6322515EC1BF13";
const BARCODE_ITEM_SELECTOR = "800011";
const win = Dimensions.get("screen");

enum steps {
  DEFAULT = "default",
  SCANNING_GROUPER = "scanning_grouper",
  SCANNING_ITEMS = "scanning_items",
  ITEM_SELECTOR = "item_selector",
  QUANTITY = "quantity"
}

interface Props extends ProcessDialogProps {}

interface State extends ProcessDialogState {
  hasPermission?: boolean;
  scanning?: boolean;
  scanned?: boolean;
  currentStep?: steps;
  currentStepLabel?: string;
  data?: object;
  undoData?: object;
  groupby_barcode?: string;
  Barcode?: string;
  itemBarcodeEan128Data?: object;
  item_selector?: any;
  item_selector$_identifier?: any;
  showSelector?: boolean;
  loading?: any;
  undoItemBarcode?: string;
  undoQty?: any;
  identifier?: any;
  cameraPermission: any;
  microphonePermission: any;
  ableToRead: boolean;
}

@observer
export default class ScanDialog extends ProcessDialog<Props, State> {
  ean128Config: object;
  supportedBarcodes: any;
  itemGrouperRef: any;
  camera: any;
  barcodeCodes: any;
  devices: any[];
  device: any;

  constructor(props) {
    super(props);
    this.state = {
      hasPermission: null,
      scanning: false,
      scanned: false,
      currentStep: steps.DEFAULT,
      currentStepLabel: "",
      data: {},
      undoData: {},
      groupby_barcode: null,
      Barcode: null,
      itemBarcodeEan128Data: null,
      item_selector: null,
      item_selector$_identifier: null,
      showSelector: false,
      cameraPermission: null,
      microphonePermission: null,
      ableToRead: true
    };
    this.ean128Config = null;
  }

  onDismiss = () => {
    this.resetValues();
    this.props.hideDialog();
  };

  onCancelPressed = () => {
    this.resetValues();
    this.props.hideDialog();
  };

  onDonePressed = async () => {
    await this.defaultOnDonePressed();
    this.resetValues();
  };

  resetValues = () => {
    this.setState({
      data: {},
      groupby_barcode: null,
      Barcode: null,
      item_selector: null,
      item_selector$_identifier: null,
      processSnackbarVisible: false,
      scanned: false,
      currentStep: steps.SCANNING_GROUPER
    });
  };

  nextStep = () => {
    let nextStep;
    let label;
    let param = null;

    switch (this.state.currentStep) {
      case steps.DEFAULT:
        param = this.props.process.parameters.find(
          p => p.referenceSearchKey === BARCODE_ITEM_GROUPER
        );
        label = param.name;

        nextStep = steps.SCANNING_GROUPER;
        break;
      case steps.SCANNING_GROUPER:
        param = this.props.process.parameters.find(
          p => p.referenceSearchKey === BARCODE_ITEM
        );
        label = param.name;

        nextStep = steps.SCANNING_ITEMS;
        break;
      case steps.SCANNING_ITEMS:
        param = this.props.process.parameters.find(
          p => p.referenceSearchKey === BARCODE_ITEM_GROUPER
        );
        label = param.name;
        if (
          !this.props.process.parameters.find(
            p => p.referenceSearchKey === BARCODE_ITEM_QTY
          )
        ) {
          this.onQuantitySubmit();
          nextStep = steps.SCANNING_ITEMS;
          break;
        } else {
          nextStep = steps.QUANTITY;
          break;
        }
      case steps.ITEM_SELECTOR:
        param = this.props.process.parameters.find(
          p => p.referenceSearchKey === BARCODE_ITEM_GROUPER
        );
        label = param.name;
        this.setState({ showSelector: false });
        nextStep = steps.QUANTITY;
        break;
      case steps.QUANTITY:
        param = this.props.process.parameters.find(
          p => p.referenceSearchKey === BARCODE_ITEM_QTY
        );
        label = param.name;
        this.onQuantitySubmit();
        nextStep = steps.SCANNING_ITEMS;
        break;

      default:
        label = "";
        nextStep = steps.DEFAULT;
        break;
    }

    this.setState({
      scanned: false,
      currentStep: nextStep,
      currentStepLabel: label
    });
  };

  getNextStepLabel = () => {
    switch (this.state.currentStep) {
      case steps.SCANNING_GROUPER:
        return locale.t("ScanDialog:ScanItems");
      case steps.DEFAULT:
      case steps.ITEM_SELECTOR:
      case steps.SCANNING_ITEMS:
        return locale.t("ScanDialog:NextStep");
      case steps.QUANTITY:
        return locale.t("Done");
      default:
        return locale.t("ScanDialog:NextStep");
    }
  };

  getTitle = () => {
    if (this.state.currentStepLabel !== "") {
      return locale.t("ScanDialog:ScanTitle", {
        item: this.state.currentStepLabel
      });
    } else {
      return this.props.process.name;
    }
  };

  onQuantitySubmit = () => {
    if (this.state.Barcode || this.state.item_selector) {
      const scanInfo = this.state.data;
      let totalQty = "1";
      let undoQty = "1";

      const quantityParam = this.props.process.parameters.find(parameter => {
        return parameter.referenceSearchKey === BARCODE_ITEM_QTY;
      });

      if (quantityParam) {
        const quantity: string = this.state[
          quantityParam.dBColumnName
        ].toString();
        if (quantity) {
          // FIXME: support number parsing with locales
          totalQty = quantity.replace(",", ".");
          undoQty = quantity.replace(",", ".");
        }
      }

      // new barcode: add to array
      if (scanInfo[this.state.groupby_barcode]) {
        scanInfo[this.state.groupby_barcode].push({
          barcode: this.state.Barcode,
          id: this.state.item_selector,
          ean128Data: this.state.itemBarcodeEan128Data,
          quantity: totalQty
        });
      } else {
        scanInfo[this.state.groupby_barcode] = [
          {
            barcode: this.state.Barcode,
            id: this.state.item_selector,
            ean128Data: this.state.itemBarcodeEan128Data,
            quantity: totalQty
          }
        ];
      }
      Snackbar.showMessage(
        locale.t("ScanDialog:BarcodeScanned", {
          barcode: this.state.Barcode || this.state.item_selector$_identifier,
          qty: totalQty || locale.t("ScanDialog:TBD")
        }),
        3000
      );

      this.setState({
        scanned: false,
        Barcode: "",
        item_selector$_identifier: null,
        itemBarcodeEan128Data: null,
        data: scanInfo,
        undoItemBarcode: this.state.Barcode,
        undoQty
      });

      if (quantityParam) {
        // @ts-ignore
        this.setState({
          [quantityParam.dBColumnName]: ""
        });
      }
      this.setState({ ableToRead: true });
    }
  };

  disableToRead = () => {
    this.setState({ ableToRead: false });
  };

  handleBarCodeScanned = (barcode?: string) => {
    if (barcode) {
      this.setState({
        groupby_barcode: barcode,
        scanned: true,
        Barcode: barcode
      });
    }
  };

  changeInput = (
    field: Field,
    value: string,
    key: string,
    identifier?: string
  ) => {
    // @ts-ignore
    this.setState({ [field.dBColumnName]: value });
    if (identifier) {
      // @ts-ignore
      this.setState({ [`${field.dBColumnName}$_identifier`]: identifier });
    }
  };

  onGrouperBarcodeSubmit = () => {
    this.setState({ scanned: true });
    this.nextStep();
  };

  onItemIdSubmit = () => {
    this.setState({ scanned: true });
  };

  renderInputCard = () => {
    if (this.state.loading) {
      // @ts-ignore
      return <ActivityIndicator animated={this.state.loading} />;
    }
    return this.props.process.parameters.map((parameter: any, index: number) => {
      switch (true) {
        case parameter.referenceSearchKey === BARCODE_ITEM_GROUPER &&
          this.state.currentStep === steps.DEFAULT:
          return (
            <View style={{ width: "100%", height: "100%" }} key={`param-${index}`}>
              <View
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <View
                  style={{
                    width: "100%",
                    height: "60%",
                    backgroundColor: defaultTheme.colors.background
                  }}
                ></View>
                <View
                  style={{
                    width: "100%",
                    height: "40%",
                    backgroundColor: defaultTheme.colors.accent
                  }}
                ></View>
              </View>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  flexDirection: "row"
                }}
              >
                <Image
                  style={styles.image}
                  resizeMode={"contain"}
                  source={{ uri: imgCodeScan }}
                />
                <View
                  style={{
                    width: "40%",
                    flexDirection: "row",
                    height: "60%",
                    alignItems: "center"
                  }}
                >
                  <Text allowFontScaling={false} style={{ fontSize: 15 }}>
                    {this.props.process.helpComment}
                  </Text>
                  <Button onPress={() => this.nextStep()}>
                    <Icon name="arrowright" size={35} />
                  </Button>
                </View>
              </View>
            </View>
          );
        case parameter.referenceSearchKey === BARCODE_ITEM_GROUPER &&
          this.state.currentStep === steps.SCANNING_GROUPER:
          return (
            <View
              style={{ margin: 5, width: "90%", alignSelf: "center" }}
              key={`param-${index}`}
            >
              <Reference
                ref={ref => (this.itemGrouperRef = ref)}
                referenceKey={parameter.reference}
                key={`ref-${parameter.id}`}
                field={parameter}
                value={this.state.groupby_barcode}
                onBlur={() => {}}
                onSubmitEditing={this.onGrouperBarcodeSubmit}
                {...this.props}
              />
              <Text allowFontScaling={false}>{parameter.helpComment}</Text>
            </View>
          );
        case !this.state.showSelector &&
          parameter.referenceSearchKey === BARCODE_ITEM &&
          this.state.currentStep === steps.SCANNING_ITEMS:
          return (
            <View
              key={`param-${index}`}
              style={{ margin: 5, width: "90%", alignSelf: "center" }}
            >
              <Reference
                keyboardType="default"
                referenceKey={parameter.reference}
                field={parameter}
                value={this.state.Barcode}
                valueKey="Barcode"
                onBlur={() => {}}
                onSubmitEditing={this.onItemIdSubmit}
                {...this.props}
              />
              {this.props.process.parameters.find(
                p => p.referenceSearchKey === BARCODE_ITEM_SELECTOR
              ) ? (
                <TouchableOpacity
                  key={`param-touchable-${index}`}
                  activeOpacity={0.5}
                  onPress={() =>
                    this.setState({
                      Barcode: null,
                      showSelector: true,
                      currentStep: steps.ITEM_SELECTOR
                    })
                  }
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      marginTop: "-2.5%",
                      marginLeft: "60%",
                      fontSize: 15,
                      borderBottomColor: defaultTheme.colors.textSecondary,
                      borderStyle: "solid",
                      borderBottomWidth: 0.5,
                      textAlign: "center"
                    }}
                  >
                    {locale.t("Or_select") +
                      this.props.process.parameters.find(
                        p => p.referenceSearchKey === BARCODE_ITEM_SELECTOR
                      ).name}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View key={`param-view-${index}`}></View>
              )}

              <Text
                allowFontScaling={false}
                style={{ fontSize: 15, marginBottom: 10 }}
              >
                {parameter.helpComment}
              </Text>
            </View>
          );
        case this.state.showSelector &&
          parameter.referenceSearchKey === BARCODE_ITEM_SELECTOR &&
          this.state.currentStep === steps.ITEM_SELECTOR:
          return (
            <View
              key={`param-${index}`}
              style={{ margin: 5, width: "90%", alignSelf: "center" }}
            >
              <Reference
                keyboardType="default"
                referenceKey={parameter.reference}
                field={parameter}
                selector={parameter.selector}
                value={this.state.item_selector$_identifier}
                valueKey="item_selector"
                identifier={this.state.item_selector$_identifier}
                showSnackbar={this.showSnackbar}
              />
              <TouchableOpacity
                key={`param-touchable-${index}`}
                activeOpacity={0.5}
                onPress={() =>
                  this.setState({
                    item_selector: null,
                    item_selector$_identifier: null,
                    showSelector: false,
                    currentStep: steps.SCANNING_ITEMS
                  })
                }
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    marginTop: "-2.5%",
                    marginLeft: "80%",
                    fontSize: 15,
                    borderBottomColor: defaultTheme.colors.textSecondary,
                    borderStyle: "solid",
                    borderBottomWidth: 0.5,
                    textAlign: "center"
                  }}
                >
                  {locale.t("Or_scan")}
                </Text>
              </TouchableOpacity>
              <Text
                allowFontScaling={false}
                style={{ fontSize: 15, marginBottom: 10 }}
              >
                {parameter.helpComment}
              </Text>
            </View>
          );
        case parameter.referenceSearchKey === BARCODE_ITEM_QTY &&
          this.state.currentStep === steps.QUANTITY:
          return (
            <View
              key={`param-${index}`}
              style={{ margin: 5, width: "90%", alignSelf: "center" }}
            >
              <Reference
                key={`ref-${parameter.id}`}
                ref={input => {
                  this.inputs[BARCODE_ITEM_QTY] = input;
                }}
                field={parameter}
                value={this.state[parameter.dBColumnName]}
                valueKey={parameter.dBColumnName}
                referenceKey={parameter.reference}
                keyboardType="decimal-pad"
                onBlur={() => {}}
                returnKeyType={this.props.qtyReturnKeyType || "done"}
                {...this.props}
              />
              <Text allowFontScaling={false}>{parameter.helpComment}</Text>
            </View>
          );

        default:
          return null;
      }
    });
  };

  postRenderDialogContent = () => {
    if (this.state.currentStep !== steps.DEFAULT) {
      return (
        <View style={{ width: "80%", marginLeft: "10%", marginTop: 10 }}>
          <Button
            disabled={
              (this.state.currentStep === steps.SCANNING_GROUPER &&
                !this.state.groupby_barcode) ||
              (this.state.currentStep === steps.SCANNING_ITEMS &&
                !this.state.Barcode) ||
              (this.state.currentStep === steps.ITEM_SELECTOR &&
                !this.state.item_selector$_identifier)
            }
            style={{ backgroundColor: defaultTheme.colors.accent }}
            onPress={() => this.nextStep()}
          >
            {this.getNextStepLabel()}
          </Button>
          {this.state.currentStep === steps.ITEM_SELECTOR ||
            this.state.currentStep === steps.SCANNING_ITEMS ? (
            <Button
              style={{
                marginTop: "5%",
                borderTopWidth: 1,
                borderStyle: "solid",
                borderColor: defaultTheme.colors.primary
              }}
              onPress={() => {
                this.nextStep();
                this.setState({
                  currentStep: steps.SCANNING_GROUPER,
                  Barcode: "",
                  groupby_barcode: ""
                });
              }}
            >
              {locale.t("Back_to")}{" "}
              {
                this.props.process.parameters.find(
                  p => p.referenceSearchKey === BARCODE_ITEM_GROUPER
                ).name
              }
            </Button>
          ) : (
            <View></View>
          )}
        </View>
      );
    } else {
      return (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: defaultTheme.colors.accent
          }}
        ></View>
      );
    }
  };

  renderDialogContent = () => {
    return (
      <View
        style={{
          height: win.height,
          flexDirection: "column",
          width: "100%",
          paddingBottom: 30
        }}
      >
        <View style={{ height: "60%", width: "100%" }}>
          <CameraBarCode
            onReadCode={this.handleBarCodeScanned}
            ableToRead={this.state.ableToRead}
            disableReading={this.disableToRead}
          />
        </View>
        <View
          style={{
            height: "40%",
            width: "100%",
            flexDirection: "column",
            backgroundColor: defaultTheme.colors.background,
            alignItems: "center",
            borderWidth: 0.5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: "-5%"
          }}
        >
          <View style={{ height: "50%", width: "100%", marginTop: 20 }}>
            <FormContext.Provider
              value={{
                getRecordContext: this.getContext,
                onChangeInput: this.changeInput,
                onChangeSelectorItem: this.changeInput,
                onSubmit: this.onQuantitySubmit
              }}
            >
              {this.renderInputCard()}
            </FormContext.Provider>
            <View style={{ width: "100%" }}>
              {this.postRenderDialogContent()}
            </View>
          </View>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  buttonStyle: {
    minHeight: 25,
    backgroundColor: defaultTheme.colors.accent
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    height: "100%",
    width: "100%"
  },
  image: {
    width: "40%",
    height: "100%"
  }
});
