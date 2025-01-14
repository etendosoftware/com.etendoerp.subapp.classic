import { IRecord } from "./Record";

class BreadCrumbs {
  label: string;
  constructor(record: IRecord) {
    this.label = record.id;
  }
}

const NEW_RECORD = "-1";

export { BreadCrumbs, NEW_RECORD };
