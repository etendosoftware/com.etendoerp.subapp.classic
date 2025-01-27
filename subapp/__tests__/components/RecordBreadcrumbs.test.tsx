import React from 'react';
import { render } from '@testing-library/react-native';
import RecordBreadcrumbs from '../../src/components/RecordBreadcrumbs';
import { defaultTheme } from '../../src/themes';

describe('RecordBreadcrumbs', () => {
  describe('rendering', () => {
    test('should render breadcrumbs when there are multiple items', () => {
      const breadcrumbs = ['Home', 'Products', 'Details'];
      const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
        <RecordBreadcrumbs breadcrumbs={breadcrumbs} />
      );

      // Check if main container exists
      const mainView = UNSAFE_getByType('View');
      expect(mainView).toBeTruthy();

      // Check if all breadcrumb texts are rendered
      const texts = UNSAFE_getAllByType('Text');
      
      // Verify breadcrumb content
      breadcrumbs.forEach(breadcrumb => {
        const textElements = texts.filter(text => 
          text.props.children === breadcrumb
        );
        expect(textElements).toBeTruthy();
        expect(textElements.length).toBeGreaterThan(0);
      });

      // Verify separators
      const separators = texts.filter(text => 
        text.props.children === '/'
      );
      expect(separators).toHaveLength(breadcrumbs.length);
    });

    test('should return null when breadcrumbs length is less than 2', () => {
      const { UNSAFE_root } = render(
        <RecordBreadcrumbs breadcrumbs={['Home']} />
      );
      expect(UNSAFE_root.children.length).toBe(0);
    });
  });

  describe('styling', () => {
    test('should apply correct styles', () => {
      const { UNSAFE_getByType } = render(
        <RecordBreadcrumbs breadcrumbs={['Home', 'Products']} />
      );
      
      const mainView = UNSAFE_getByType('View');
      expect(mainView.props.style).toEqual({
        backgroundColor: defaultTheme.colors.backgroundSecondary,
        padding: 5,
        flexDirection: 'row',
        paddingHorizontal: 25.5,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: defaultTheme.colors.greyaccent
      });
    });

    test('should apply correct text styles', () => {
      const { UNSAFE_getAllByType } = render(
        <RecordBreadcrumbs breadcrumbs={['Home', 'Products']} />
      );

      const texts = UNSAFE_getAllByType('Text');
      
      // Skip the wrapper Text
      const contentTexts = texts.slice(1);
      
      // Check breadcrumb text styles
      contentTexts.forEach(text => {
        if (text.props.children !== '/') {
          expect(text.props.style).toEqual({
            color: defaultTheme.colors.text,
            fontSize: 15
          });
        }
      });

      // Check separator styles
      const separators = contentTexts.filter(text => text.props.children === '/');
      separators.forEach(separator => {
        expect(separator.props.style).toEqual({
          color: defaultTheme.colors.textSecondary,
          fontSize: 15,
          paddingHorizontal: 8
        });
      });
    });
  });
});
