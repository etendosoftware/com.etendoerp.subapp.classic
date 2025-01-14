import React from "react";
import { View } from "react-native";
import Modal, { ModalProps, ModalState } from "./Modal";
import { InputField } from "../InputField";
import DateTimePicker from "./DateTimePicker";
import List from "./List";
import { PAttribute } from "../../ob-api/objects";
import { ActivityIndicator, Paragraph } from "react-native-paper";
import locale from "../../i18n/locale";
import FormContext from "../../contexts/FormContext";
import { IField } from "../Field";
import { References } from "../../constants/References";

export interface AttributeProps extends ModalProps {
  getFieldValue?: any;
  showSnackbar?: any;
  valueKey?: string;
  windowId?: string;
  tabId?: string;
}

interface State extends ModalState {
  errorMessage: object;
  selectedListAttributes: object;
  attribute: {
    assignedAttributes: any;
    values: any;
    lot: any;
    id: string;
    serialNo?: string;
    expirationDate?: string;
    description?: string;
  };
}

export default class Attribute extends Modal<AttributeProps, State> {
  static contextType = FormContext;

  productId: string;
  locatorId: object;
  attributeSetId: string;
  description: string;

  constructor(props) {
    super(props);
    this.state = {
      attribute: null,
      errorMessage: null,
      selectedListAttributes: {},
      loading: false,
      showPickerModal: false
    };
  }

  onShow = async () => {
    this.productId = this.props.getFieldValue("inpName", "mProductId");
    this.locatorId = this.props.getFieldValue("inpName", "mLocatorId");
    this.attributeSetId = this.props.getFieldValue(
      "inpName",
      "mAttributesetinstanceId"
    );
    this.description = this.props.getFieldValue(
      "default",
      "attributeSetValue$_identifier"
    );

    if (!this.state.attribute) {
      await this.getStructure();
    }
  };

  onHide = () => {
    this.setState({ attribute: null, errorMessage: null });
  };

  onDonePressed = async () => {
    if (!this.state.errorMessage) {
      await this.sendAttribute(this.state.attribute);
    }
  };

  onChangeInput = (
    input,
    key,
    isAssignedAttribute?,
    assignedAttributeIndex?
  ) => {
    const newAttr = this.state.attribute;

    if (isAssignedAttribute) {
      newAttr.assignedAttributes[assignedAttributeIndex][key] = input;
    } else {
      newAttr.values = newAttr.values || {};
      newAttr.values[key] = input;
    }
    this.setState({ attribute: newAttr });
  };

  onChangeDateTime = (field: IField, value: string) => {
    this.onChangeInput(value, field.id);
  };

  sendAttribute = async attr => {
    this.setState({ loading: true });
    try {
      const response = await new PAttribute().saveAttribute({
        productId: this.productId,
        locatorId: this.locatorId,
        ...attr
      });

      if (response.error || (response.response && response.response.error)) {
        throw new Error(response.error || response.response.error?.message);
      }

      const attributeId = response.id;
      const attributeIdentifier = response._identifier;
      this.context.onChangeAttribute(
        attributeId,
        this.props.valueKey,
        attributeIdentifier
      );
    } catch (error) {
      this.context.showSnackbar(error.message, true);
    } finally {
      this.setState({ loading: false });
    }
  };

  getStructure = async () => {
    this.setState({ loading: true });
    try {
      const response = await PAttribute.getAttributes(
        this.attributeSetId,
        this.props.windowId,
        this.props.tabId,
        this.productId,
        this.description
      );

      if (response.error || (response.response && response.response.error)) {
        throw new Error(response.error || response.response.error?.message);
      }

      this.setState({ attribute: response });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    } finally {
      this.setState({ loading: false });
    }
  };

  renderDialogContent = () => {
    const basicAttributes = [];
    let assignedAttributes = [];
    let description = null;

    if (this.state.attribute?.lot) {
      basicAttributes.push(
        // careful, this should update our state, not the record's
        // change value to one of our state
        // change onChangeInput to one of our functions that affect our state
        <FormContext.Provider
          value={{
            getRecordContext: this.context.getRecordContext,
            onChangeInput: input => this.onChangeInput(input, "lot")
          }}
        >
          <InputField
            key={`lot-${this.state.attribute.id}`}
            keyboardType="default"
            field={{
              id: this.state.attribute.id,
              name: locale.t("Attribute:Lot"),
              readOnly: false,
              column: { updatable: true }
            }}
            value={this.state.attribute.values?.lot}
            valueKey="lot"
          />
        </FormContext.Provider>
      );
    }

    if (this.state.attribute?.serialNo) {
      basicAttributes.push(
        // careful, this should update our state, not the record's
        // change value to one of our state
        // change onChangeInput to one of our functions that affect our state
        <FormContext.Provider
          value={{
            getRecordContext: this.context.getRecordContext,
            onChangeInput: input => this.onChangeInput(input, "serialNo")
          }}
        >
          <InputField
            key={`serialno-${this.state.attribute.id}`}
            keyboardType="default"
            field={{
              id: this.state.attribute.id,
              name: locale.t("Attribute:SerialNo"),
              readOnly: false,
              column: { updatable: true }
            }}
            value={this.state.attribute.values?.serialNo}
            valueKey="serialNo"
          />
        </FormContext.Provider>
      );
    }

    if (this.state.attribute?.expirationDate) {
      // careful, this should update our state, not the record's
      // change value to one of our state
      // change onChangeDateTime to one of our functions that affect our state
      basicAttributes.push(
        <FormContext.Provider
          value={{
            getRecordContext: this.context.getRecordContext,
            onChangeDateTime: this.onChangeDateTime
          }}
        >
          <DateTimePicker
            key={this.context.field.id}
            fieldStyle={{
              marginTop: 8
            }}
            dateMode="date"
            value={this.state.attribute.values?.expirationDate}
            valueKey="expirationDate"
            referenceKey={References.Date}
            field={{
              id: this.state.attribute.id,
              name: locale.t("Attribute:ExpirationDate"),
              readOnly: false,
              column: { updatable: true }
            }}
          />
        </FormContext.Provider>
      );
    }

    if (this.state.attribute?.description) {
      description = (
        <FormContext.Provider
          value={{
            getRecordContext: this.context.getRecordContext,
            onChangeInput: () => {}
          }}
        >
          <InputField
            key={`description-${this.state.attribute.id}`}
            keyboardType="default"
            field={{
              id: this.state.attribute.id,
              name: locale.t("Attribute:Description"),
              readOnly: true,
              column: { updatable: false }
            }}
            value={this.state.attribute.description}
            valueKey="description"
          />
        </FormContext.Provider>
      );
    }

    if (this.state.attribute?.assignedAttributes) {
      assignedAttributes = this.state.attribute.assignedAttributes.map(
        (attribute, index) => {
          if (attribute.list) {
            return (
              <FormContext.Provider
                value={{
                  getRecordContext: this.context.getRecordContext,
                  onChangePicker: input =>
                    this.context.onChangeInput(
                      input,
                      "selectedValue",
                      true,
                      index
                    )
                }}
                key={index}
              >
                <List
                  key={attribute.id}
                  pickerItems={attribute.listValues}
                  field={{
                    id: attribute.id,
                    name: attribute.name,
                    readOnly: false,
                    column: { updatable: true }
                  }}
                  valueKey={attribute.id}
                  value={
                    this.state.attribute.assignedAttributes[index].selectedValue
                  }
                />
              </FormContext.Provider>
            );
          } else {
            return (
              <FormContext.Provider
                value={{
                  getRecordContext: this.context.getRecordContext,
                  onChangeInput: input =>
                    this.onChangeInput(input, "value", true, index)
                }}
                key={index}
              >
                <InputField
                  key={`${attribute.name}-${attribute.id}`}
                  keyboardType="default"
                  field={{
                    id: attribute.id,
                    name: attribute.name,
                    readOnly: false,
                    column: { updatable: true }
                  }}
                  value={this.state.attribute.assignedAttributes[index].value}
                  valueKey={attribute.name}
                />
              </FormContext.Provider>
            );
          }
        }
      );
    }
    return (
      <View>
        {this.state.errorMessage && (
          <Paragraph>{this.state.errorMessage}</Paragraph>
        )}
        {this.state.loading && (
          <ActivityIndicator animating={this.state.loading} />
        )}
        {basicAttributes}
        {assignedAttributes}
        {description}
      </View>
    );
  };
}
