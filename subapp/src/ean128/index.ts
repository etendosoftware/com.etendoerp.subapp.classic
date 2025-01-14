import { parse as parseDate } from "date-fns";

export const SMFEAN = {
  EANDataTypes: {
    Integer: "Integer",
    Decimal: "Decimal",
    Date: "Date",
    String: "String"
  },
  Constants: {
    EAN_DATE_FORMAT: "yyMMdd",
    MAX_EAN_PARSE_LOOPS: 10,
    WEIGHT_AIS: ["310X", "320X", "330X", "340X", "356X", "357X"],
    BOX_QTY_AIS: ["37"]
  }
};

export default class EANParser {
  fncChar = null;
  config = null;

  constructor(config) {
    this.init();

    this.setConfig(config);
  }

  init() {
    this.fncChar = String.fromCharCode(29); // Group separator
  }

  setConfig(config) {
    // Format of config is like this
    /*
    [
      { 
        "id":"95435FB883B1458CA516CDA911BDADCF",
        "eanTypeName":"GS1-128",
        "isdefault":true,
        "ai":"01",
        "contentLength":14,
        "isFixedLength":true
      }
      ,
      ...
    ]
    */

    this.config = config;
  }

  handleFormat(content, decimalAI, dataType) {
    switch (dataType) {
      case SMFEAN.EANDataTypes.Integer:
        return Number.parseInt(content);
      case SMFEAN.EANDataTypes.Decimal:
        if (decimalAI) {
          var exponent = Number.parseInt(decimalAI),
            contentInteger = Number.parseInt(content);
          if (isNaN(exponent)) {
            return content;
          }
          return (contentInteger / Math.pow(10, exponent)).toString();
        }
        return content;
      case SMFEAN.EANDataTypes.String:
        return content;
      case SMFEAN.EANDataTypes.Date:
        return parseDate(content, SMFEAN.Constants.EAN_DATE_FORMAT, new Date());
    }
  }

  parse(ean) {
    var result = { originalBarcode: ean, AIs: {} },
      currentPosition = 0,
      currentAIEnd = 0,
      currentEan = ean.trim().replace(/ /g, ""),
      localAI,
      decimalAI,
      decimalGroup,
      entityFieldName,
      configLoops = 0,
      me = this;

    if (!this.config) {
      return { error: true, errorMessage: `No configuration was supplied` };
    }

    while (
      currentPosition < currentEan.length &&
      configLoops <= SMFEAN.Constants.MAX_EAN_PARSE_LOOPS
    ) {
      this.config.forEach(attribute => {
        var maxAILength = 0;

        localAI = attribute.ai;

        if (attribute.dataType === SMFEAN.EANDataTypes.Decimal) {
          // Obtain the decimal group index
          decimalGroup = localAI.match(/[a-z,A-Z]/);
          if (decimalGroup) {
            localAI = localAI.slice(0, decimalGroup.index);
          }
        }

        if (
          currentPosition <= currentEan.length &&
          currentEan.slice(
            currentPosition,
            currentPosition + localAI.length
          ) === localAI
        ) {
          // Hit: extract content

          if (attribute.isFixedLength) {
            currentAIEnd =
              currentPosition + attribute.ai.length + attribute.contentLength;
            result.AIs[localAI] = currentEan.slice(
              currentPosition + attribute.ai.length,
              currentAIEnd
            );
          } else {
            maxAILength =
              currentPosition + attribute.ai.length + attribute.contentLength;
            // we take the maximum length possible and check for the end char later
            var tempEan = currentEan.slice(
                currentPosition + attribute.ai.length,
                maxAILength
              ),
              separatorPosition = tempEan.indexOf(me.fncChar);

            if (separatorPosition === -1) {
              // this is the last element or separator is missing
              result.AIs[localAI] = tempEan;
              currentAIEnd = currentEan.length;
            } else {
              result.AIs[localAI] = tempEan.slice(0, separatorPosition);
              currentAIEnd += attribute.ai.length + separatorPosition + 1; //(plus separator char)
            }
          }

          // handle decimal character
          if (decimalGroup) {
            // extract decimal from AI
            decimalAI = currentEan.slice(
              currentPosition + localAI.length,
              currentPosition + attribute.ai.length
            );
          }

          // handle format before moving on
          result.AIs[localAI] = me.handleFormat(
            result.AIs[localAI],
            decimalAI,
            attribute.dataType
          );

          // handle entity fields
          if (attribute.entity && attribute.entityField) {
            entityFieldName = attribute.entity + "_" + attribute.entityField;
          }
          if (attribute.attributeId) {
            entityFieldName = attribute.attributeId;
          }
          if (attribute.isLot) {
            entityFieldName = "lot";
          }
          if (attribute.isSerialNo) {
            entityFieldName = "serialno";
          }
          if (attribute.isGuaranteeDate) {
            entityFieldName = "guaranteedate";
          }

          if (
            !result[entityFieldName] ||
            (result[entityFieldName] &&
              result[entityFieldName + "_seqno"] <= attribute.sequenceNumber)
          ) {
            result[entityFieldName] = {
              value: result.AIs[localAI],
              type: attribute.dataType
            };
            result[entityFieldName + "_seqno"] = attribute.sequenceNumber;
          }

          // move position to next
          currentPosition = currentAIEnd;
        } else if (
          currentPosition <= currentEan.length &&
          result.AIs[localAI]
        ) {
          // Miss, but we're checking an AI that was processed, possibly this time with different entity
          if (attribute.entity && attribute.entityField) {
            result[attribute.entity + "_" + attribute.entityField] = {
              value: result.AIs[localAI],
              type: attribute.dataType
            };
            result[attribute.entity + "_" + attribute.entityField + "_seqno"] =
              attribute.sequenceNumber;
          }
        } else {
          // Miss: continue
        }
      });
      configLoops += 1;
    }

    if (configLoops > SMFEAN.Constants.MAX_EAN_PARSE_LOOPS) {
      return {
        error: true,
        errorMessage: `${ean} was scanned without any result`
      };
    }

    return result;
  }
}
