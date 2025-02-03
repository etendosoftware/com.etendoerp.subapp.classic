import record from '../../mockdata/bprecord.json'
import fields from "../../mockdata/bprecordfields.json";
import recordExpected from './bpexpected.json'
import { DictionaryUtils } from '../../../src/ob-api/utils/DictionaryUtils' 

describe("Dictionary Utils", () => {
  test("test cbpartner convertion", () => {
    const result = DictionaryUtils.getInpRecord("123", record, fields);
    expect(result).toStrictEqual(recordExpected);
  })
})
