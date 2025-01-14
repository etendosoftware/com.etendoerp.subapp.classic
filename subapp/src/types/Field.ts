import { StyleProp, ViewStyle } from "react-native";
import { References } from "../constants/References";

export type Field = {
  id: string;
  name: string;
  readOnly: boolean;
  column: {
    _identifier: string;
    updatable: boolean;
    reference: References;
    keyColumn: string;
    table: string;
  };
  textInputStyle?: StyleProp<ViewStyle>;
  columnName: string;
  [key: string]: any;
};

export type Fields = {
  [key: string]: Field;
};
