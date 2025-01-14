import React from "react";
import { RenderFieldsFunc } from "../record/RecordForm";
import Reference from "../Reference";
import FormContext from "../../contexts/FormContext";
import TabContext from "../../contexts/TabContext";
import { obIdentifierKey } from "../Tab";

export default abstract class ComponentWithFields<P, S> extends React.Component<
  P,
  S
> {
  static contextType = TabContext;

  renderFields: RenderFieldsFunc = (fields, record) => {
    const isNew = !!!record.id;
    return Object.keys(fields).map(key => {
      const field = fields[key];

      if (!field.displayed) {
        // some field we need even when not displayed (stored in session, for example)
        // so we do not render anything, but will be used to create context in some calls
        // like in Tab.js
        return null;
      }

      return (
        <Reference
          key={`ref-${field.id}`}
          referenceKey={field.column.reference}
          field={field}
          identifier={record[key + obIdentifierKey]}
          value={record[key]}
          valueKey={key}
          isNewRecord={isNew}
          pickerItems={field.refList}
          selector={field.selector}
          tabUIPattern={this.context?.currentTab?.uIPattern}
        />
      );
    });
  };
}
