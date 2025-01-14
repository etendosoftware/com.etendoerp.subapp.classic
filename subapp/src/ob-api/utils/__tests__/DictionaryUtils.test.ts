import record from '../../../../__tests__/mockdata/bprecord.json'
import fields from "../../../../__tests__/mockdata/bprecordfields.json";
import recordExpected from './bpexpected.json'
import { DictionaryUtils } from '../DictionaryUtils'

describe("Dictionary Utils", () => {
  test("test cbpartner convertion", () => {
    const result = DictionaryUtils.getInpRecord("123", record, fields);
    expect(result).toStrictEqual(recordExpected);
  })
})