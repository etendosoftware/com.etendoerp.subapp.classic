/*
MIT License

Copyright (c) 2017 Callstack

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This banner is extracted and modified to allow children that are not of type "string"
The Surface component also is modified to not have any elevation
The Banner's Icon is also removed
*/

import * as React from "react";
import {
  StyleSheet,
  StyleProp,
  TextInput,
  I18nManager,
  ViewStyle,
  TextStyle,
  View,
  TouchableOpacity
} from "react-native";
import { Surface, withTheme, IconButton } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import MaterialCommunityIcon from "./MaterialCommunityIcon";
import color from "color";
import { defaultTheme } from "../../themes";
import { BLACK } from "../../styles/colors";

type Props = React.ComponentPropsWithRef<typeof TextInput> & {
  /**
   * Accessibility label for the button. This is read by the screen reader when the user taps the button.
   */
  clearAccessibilityLabel?: string;
  /**
   * Accessibility label for the button. This is read by the screen reader when the user taps the button.
   */
  searchAccessibilityLabel?: string;
  /**
   * Hint text shown when the input is empty.
   */
  placeholder?: string;
  /**
   * The value of the text input.
   */
  value: string;
  /**
   * Icon name for the left icon button (see `onIconPress`).
   */
  icon?: IconSource;
  /**
   * Callback that is called when the text input's text changes.
   */
  onChangeText?: (query: string) => void;
  /**
   * Callback to execute if we want the left icon to act as button.
   */
  onIconPress?: () => void;
  /**
   * Set style of the TextInput component inside the searchbar
   */
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;

  /**
   * @optional
   */
  theme: ReactNativePaper.Theme;
  /**
   * Custom color for icon, default will be derived from theme
   */
  iconColor?: string;
  /**
   * Custom icon for clear button, default will be icon close
   */
  clearIcon?: IconSource;
};

/**
 * Searchbar is a simple input box where users can type search queries.
 *
 * <div class="screenshots">
 *   <img class="medium" src="screenshots/searchbar.png" />
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Searchbar } from 'react-native-paper';
 *
 * const MyComponent = () => {
 *   const [searchQuery, setSearchQuery] = React.useState('');
 *
 *   const onChangeSearch = query => setSearchQuery(query);
 *
 *   return (
 *     <Searchbar
 *       placeholder="Search"
 *       onChangeText={onChangeSearch}
 *       value={searchQuery}
 *     />
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */

class Searchbar extends React.Component<Props> {
  static defaultProps = {
    searchAccessibilityLabel: "search",
    clearAccessibilityLabel: "clear"
  };
  private handleClearPress = () => {
    this.clear();
    this.props.onChangeText && this.props.onChangeText("");
  };

  private root: TextInput | undefined | null;

  /**
   * @internal
   */ setNativeProps(args: Object) {
    return this.root && this.root.setNativeProps(args);
  }

  /**
   * Returns `true` if the input is currently focused, `false` otherwise.
   */
  isFocused() {
    return this.root && this.root.isFocused();
  }

  /**
   * Removes all text from the TextInput.
   */
  clear() {
    return this.root && this.root.clear();
  }

  /**
   * Focuses the input.
   */
  focus() {
    return this.root && this.root.focus();
  }

  /**
   * Removes focus from the input.
   */
  blur() {
    return this.root && this.root.blur();
  }

  render() {
    const {
      clearAccessibilityLabel,
      clearIcon,
      icon,
      iconColor: customIconColor,
      inputStyle,
      onIconPress,
      placeholder,
      searchAccessibilityLabel,
      style,
      theme,
      value,
      ...rest
    } = this.props;
    const { colors, roundness, dark, fonts } = theme;
    const textColor = colors.text;
    const font = fonts.regular;
    const iconColor = customIconColor || (dark ? textColor : BLACK);
    const rippleColor = color(textColor)
      .alpha(0.32)
      .rgb()
      .string();

    return (
      <Surface style={styles.container}>
        <TextInput
          allowFontScaling={false}
          style={styles.input}
          placeholder={placeholder || ""}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          underlineColorAndroid="transparent"
          returnKeyType="search"
          keyboardAppearance={dark ? "dark" : "light"}
          accessibilityTraits="search"
          accessibilityRole="search"
          ref={c => {
            this.root = c;
          }}
          value={value}
          {...rest}
        />
        <View style={styles.closeButton}>
          <TouchableOpacity activeOpacity={0.8} onPress={this.handleClearPress}>
            <IconButton
              disabled={!value}
              accessibilityLabel={clearAccessibilityLabel}
              color={value ? iconColor : "rgba(255, 255, 255, 0)"}
              rippleColor={rippleColor}
              icon={
                clearIcon ||
                (({ size, color }) => (
                  <MaterialCommunityIcon
                    name="close"
                    color={color}
                    size={size}
                    direction={I18nManager.isRTL ? "rtl" : "ltr"}
                  />
                ))
              }
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.searchButton}>
          <TouchableOpacity activeOpacity={0.8} onPress={onIconPress}>
            <IconButton
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
              rippleColor={rippleColor}
              color={iconColor}
              icon={
                icon ||
                (({ size, color }) => (
                  <MaterialCommunityIcon
                    name="magnify"
                    color={defaultTheme.colors.placeholder}
                    size={size}
                    direction={I18nManager.isRTL ? "rtl" : "ltr"}
                  />
                ))
              }
              accessibilityLabel={searchAccessibilityLabel}
            />
          </TouchableOpacity>
        </View>
      </Surface>
    );
  }
}

export default withTheme(Searchbar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent"
  },
  input: {
    height: 48,
    backgroundColor: defaultTheme.colors.background,
    flex: 1,
    fontSize: 18,
    paddingLeft: 17,
    alignSelf: "stretch",
    textAlign: I18nManager.isRTL ? "right" : "left",
    minWidth: 0,
    borderColor: defaultTheme.colors.greyaccent,
    borderWidth: 0.5,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },
  searchButton: {
    height: 48,
    width: 48,
    backgroundColor: defaultTheme.colors.accent,
    borderStyle: "solid",
    borderColor: defaultTheme.colors.greyaccent,
    borderWidth: 0.5,
    marginLeft: 3,
    marginRight: 2.7,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },
  closeButton: {
    height: 45,
    width: 45,
    backgroundColor: defaultTheme.colors.background,
    position: "absolute",
    right: 55
  }
});
