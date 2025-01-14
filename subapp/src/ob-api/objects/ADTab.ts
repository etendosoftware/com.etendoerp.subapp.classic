import { IIdentifiers } from "../../components/Card";
import { Fields } from "../../types";

export interface ADTab {
  id: string;
  uIPattern: string;
  fields: Fields;
  identifiers: IIdentifiers[];
}
