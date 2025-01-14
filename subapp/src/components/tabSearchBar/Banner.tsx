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
import { View, ViewStyle, StyleSheet, StyleProp, Animated } from "react-native";
import { Surface, Button, withTheme, shadow } from "react-native-paper";

const ELEVATION = 1;
const DEFAULT_MAX_WIDTH = 960;

type $Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type $RemoveChildren<T extends React.ComponentType<any>> = $Omit<
  React.ComponentPropsWithoutRef<T>,
  "children"
>;

type Props = $RemoveChildren<typeof Surface> & {
  /**
   * Whether banner is currently visible.
   */
  visible: boolean;
  /**
   * Content that will be displayed inside banner.
   */
  children: React.ReactNode;
  /**
   * Action items to shown in the banner.
   * An action item should contain the following properties:
   *
   * - `label`: label of the action button (required)
   * - `onPress`: callback that is called when button is pressed (required)
   *
   * To customize button you can pass other props that button component takes.
   */
  actions: Array<{
    label: string;
    onPress: () => void;
  }>;
  /**
   * Style of banner's inner content.
   * Use this prop to apply custom width for wide layouts.
   */
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  ref?: React.RefObject<View>;
  /**
   * @optional
   */
  theme: ReactNativePaper.Theme;
};

type NativeEvent = {
  nativeEvent: {
    layout: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
};

/**
 * Banner displays a prominent message and related actions.
 *
 * <div class="screenshots">
 *   <img class="medium" src="screenshots/banner.gif" />
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Image } from 'react-native';
 * import { Banner } from 'react-native-paper';
 *
 * const MyComponent = () => {
 *   const [visible, setVisible] = React.useState(true);
 *
 *   return (
 *     <Banner
 *       visible={visible}
 *       actions={[
 *         {
 *           label: 'Fix it',
 *           onPress: () => setVisible(false),
 *         },
 *         {
 *           label: 'Learn more',
 *           onPress: () => setVisible(false),
 *         },
 *       ]}
 *       icon={({size}) => (
 *         <Image
 *           source={{
 *             uri: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
 *           }}
 *           style={{
 *             width: size,
 *             height: size,
 *           }}
 *         />
 *       )}>
 *       There was a problem processing a transaction on your credit card.
 *     </Banner>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */
const Banner = ({
  visible,
  children,
  actions,
  contentStyle,
  style,
  theme,
  ...rest
}: Props) => {
  const { current: position } = React.useRef<Animated.Value>(
    new Animated.Value(visible ? 1 : 0)
  );
  const [layout, setLayout] = React.useState<{
    height: number;
    measured: boolean;
  }>({
    height: 0,
    measured: false
  });

  const { scale } = theme.animation;

  React.useEffect(() => {
    if (visible) {
      // show
      Animated.timing(position, {
        duration: 250 * scale,
        toValue: 1,
        useNativeDriver: false
      }).start();
    } else {
      // hide
      Animated.timing(position, {
        duration: 200 * scale,
        toValue: 0,
        useNativeDriver: false
      }).start();
    }
  }, [visible, position, scale]);

  const handleLayout = ({ nativeEvent }: NativeEvent) => {
    const { height } = nativeEvent.layout;
    setLayout({ height, measured: true });
  };

  // The banner animation has 2 parts:
  // 1. Blank spacer element which animates its height to move the content
  // 2. Actual banner which animates its translateY
  // In initial render, we position everything normally and measure the height of the banner
  // Once we have the height, we apply the height to the spacer and switch the banner to position: absolute
  // We need this because we need to move the content below as if banner's height was being animated
  // However we can't animated banner's height directly as it'll also resize the content inside
  const height = Animated.multiply(position, layout.height);

  const translateY = Animated.multiply(
    Animated.add(position, -1),
    layout.height
  );
  return (
    <View
      {...rest}
      style={[styles.container, shadow(ELEVATION) as ViewStyle, style]}
    >
      <View style={[styles.wrapper, contentStyle]}>
        <Animated.View style={{ height }} />
        <Animated.View
          onLayout={handleLayout}
          style={[
            layout.measured || !visible
              ? // If we have measured banner's height or it's invisible,
                // Position it absolutely, the layout will be taken care of the spacer
                [styles.absolute, { transform: [{ translateY }] }]
              : // Otherwise position it normally
                null,
            !layout.measured && !visible
              ? // If we haven't measured banner's height yet and it's invisible,
                // hide it with opacity: 0 so user doesn't see it
                { opacity: 0 }
              : null
          ]}
        >
          <View style={styles.content}>{children}</View>
          <View style={styles.actions}>
            {actions.map(({ label, ...others }, i) => (
              <Button
                key={/* eslint-disable-line react/no-array-index-key */ i}
                compact
                mode="text"
                style={styles.button}
                {...others}
              >
                {label}
              </Button>
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: ELEVATION
  },
  wrapper: {
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    maxWidth: DEFAULT_MAX_WIDTH
  },
  absolute: {
    position: "absolute",
    top: 0,
    width: "100%"
  },
  content: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 0
  },
  icon: {
    margin: 8
  },
  message: {
    flex: 1,
    margin: 8
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    margin: 4
  },
  button: {
    margin: 4
  }
});

export default withTheme(Banner);
