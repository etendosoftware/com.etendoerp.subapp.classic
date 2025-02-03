import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Field, { FieldMode, FieldProps, FieldState } from '../../src/components/Field';
import { View } from 'react-native';

// Create a concrete implementation of Field for testing
class TestField extends Field<FieldProps, FieldState> {
  renderField() {
    return <View />;
  }

  onChipSelected(fieldId: string) {
    if (this.props.onChipSelected) {
      this.props.onChipSelected(fieldId);
    }
  }
}

describe('Field', () => {
  const mockField = {
    id: 'test-field-1',
    name: 'Test Field',
    column: {
      mandatory: false
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('horizontal mode (default)', () => {
    it('renders correctly with default props', () => {
      const { getByText } = render(
        <TestField field={mockField} />
      );

      expect(getByText('Test Field:')).toBeTruthy();
    });

    it('shows mandatory indicator when field is required', () => {
      const mandatoryField = {
        ...mockField,
        column: {
          mandatory: true
        }
      };

      const { getByText } = render(
        <TestField field={mandatoryField} />
      );

      expect(getByText('Test Field: (*)')).toBeTruthy();
    });

  });

  describe('chip mode', () => {
    it('renders chip correctly', () => {
      const { getByText, getByRole } = render(
        <TestField 
          field={mockField}
          mode={FieldMode.chip}
        />
      );

      const chip = getByRole('button');
      expect(getByText('Test Field')).toBeTruthy();
      expect(chip).toBeTruthy();
    });

    it('handles chip selection', () => {
      const onChipSelected = jest.fn();
      const { getByRole } = render(
        <TestField 
          field={mockField}
          mode={FieldMode.chip}
          onChipSelected={onChipSelected}
        />
      );

      const chip = getByRole('button');
      fireEvent.press(chip);
      expect(onChipSelected).toHaveBeenCalledWith(mockField.id);
    });

    it('handles chip close when selected', () => {
      const onChipClosed = jest.fn();
      const { getByLabelText } = render(
        <TestField 
          field={mockField}
          mode={FieldMode.chip}
          selected={true}
          onChipClosed={onChipClosed}
        />
      );

      const closeButton = getByLabelText('Close');
      fireEvent.press(closeButton);
      expect(onChipClosed).toHaveBeenCalledWith(mockField.id);
    });

    it('shows mandatory indicator in chip mode', () => {
      const mandatoryField = {
        ...mockField,
        column: {
          mandatory: true
        }
      };

      const { getByText } = render(
        <TestField 
          field={mandatoryField}
          mode={FieldMode.chip}
        />
      );

      expect(getByText('Test Field (*)')).toBeTruthy();
    });
  });

  describe('special reference handling', () => {
    it('handles YesNo reference type correctly', () => {
      const yesNoField = {
        ...mockField,
        column: {
          reference: 'YesNo',
          mandatory: true
        }
      };

      const { queryByText } = render(
        <TestField field={yesNoField} />
      );

      // YesNo fields should not show mandatory indicator
      expect(queryByText('(*)')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for invalid mode', () => {
      const { toJSON } = render(
        <TestField 
          field={mockField}
          mode={999 as FieldMode}
        />
      );

      expect(toJSON()).toBeNull();
    });

    it('handles missing column property', () => {
      const fieldWithoutColumn = {
        id: 'test-field-1',
        name: 'Test Field'
      };

      const { getByText } = render(
        <TestField field={fieldWithoutColumn} />
      );

      expect(getByText('Test Field:')).toBeTruthy();
    });
  });
});
