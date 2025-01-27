import FilterValue from '../../src/types/FilterValue';

describe('FilterValue', () => {
  describe('constructor', () => {
    test('should create instance with mandatory parameters', () => {
      // Arrange
      const fieldID = 'field1';
      const label = 'Test Label';
      const value = 'test-value';
      const displayedValue = 'Test Value';
      const property = 'testProperty';
      const propertyType = 'string';

      // Act
      const filterValue = new FilterValue(
        fieldID,
        label,
        value,
        displayedValue,
        property,
        propertyType
      );

      // Assert
      expect(filterValue).toBeInstanceOf(FilterValue);
      expect(filterValue.id).toBe(fieldID + value);
      expect(filterValue.fieldID).toBe(fieldID);
      expect(filterValue.label).toBe(label);
      expect(filterValue.value).toBe(value);
      expect(filterValue.displayedValue).toBe(displayedValue);
      expect(filterValue.property).toBe(property);
      expect(filterValue.propertyType).toBe(propertyType);
      expect(filterValue.isSearchBar).toBe(false);
    });

    test('should create instance with isSearchBar parameter', () => {
      // Arrange
      const fieldID = 'field1';
      const label = 'Test Label';
      const value = 'test-value';
      const displayedValue = 'Test Value';
      const property = 'testProperty';
      const propertyType = 'string';
      const isSearchBar = true;

      // Act
      const filterValue = new FilterValue(
        fieldID,
        label,
        value,
        displayedValue,
        property,
        propertyType,
        isSearchBar
      );

      // Assert
      expect(filterValue.isSearchBar).toBe(true);
    });

    test('should set isSearchBar to false when not provided', () => {
      // Arrange
      const fieldID = 'field1';
      const label = 'Test Label';
      const value = 'test-value';
      const displayedValue = 'Test Value';
      const property = 'testProperty';
      const propertyType = 'string';

      // Act
      const filterValue = new FilterValue(
        fieldID,
        label,
        value,
        displayedValue,
        property,
        propertyType
      );

      // Assert
      expect(filterValue.isSearchBar).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return correctly formatted string representation', () => {
      // Arrange
      const fieldID = 'field1';
      const label = 'Test Label';
      const value = 'test-value';
      const displayedValue = 'Test Value';
      const property = 'testProperty';
      const propertyType = 'string';
      const filterValue = new FilterValue(
        fieldID,
        label,
        value,
        displayedValue,
        property,
        propertyType
      );

      // Act
      const result = filterValue.toString();

      // Assert
      expect(result).toBe(`Field ID: ${fieldID} | Label: ${label} | Value ${value}`);
    });
  });
});
