export default class FilterValue {
  id: string;
  fieldID: string;
  label: string;
  value: string;
  displayedValue: string;
  property: string;
  propertyType: string;
  isSearchBar: boolean;

  constructor(
    fieldID: string,
    label: string,
    value: string,
    displayedValue: string,
    property: string,
    propertyType: string,
    isSearchBar?: boolean
  ) {
    this.id = fieldID + value;
    this.fieldID = fieldID;
    this.label = label;
    this.value = value;
    this.displayedValue = displayedValue;
    this.property = property;
    this.propertyType = propertyType;
    this.isSearchBar = isSearchBar || false;
  }

  public toString(): string {
    return `Field ID: ${this.fieldID} | Label: ${this.label} | Value ${this.value}`;
  }
}
