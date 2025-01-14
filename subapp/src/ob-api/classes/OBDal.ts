"use strict";

import { Criterion, OBRest, Restrictions } from "etrest";
import { FilterValue, IRecord } from "../../types";
import { ADTab } from "../objects/ADTab";
import locale from "../../i18n/locale";

const DEFAULT_ORDER_BY = "creationDate desc";

export interface IOBDalEntity {
  entityName: string;
  whereClause: string;
  parentColumns: string[];
  hqlOrderByClause: string;
  level: number;
  sequenceNumber: string;
  criteria: any;
}

interface IOBDalOrderCriteria {
  name: string;
  asc: boolean;
}

class OBDal {
  static async tabRecords(
    entity: IOBDalEntity,
    isSalesTransaction: boolean,
    currentTab: ADTab,
    parentRecordId: string,
    context: Record<string, string>,
    currentRecordId: string,
    entityName: string,
    filters: FilterValue[],
    pageOffset: number,
    pageSize: number
  ) {
    const restrictions = this.getRestrictions(
      entity,
      isSalesTransaction,
      currentTab,
      parentRecordId,
      currentRecordId,
      filters
    );
    const orderBys = this.getOrderByClauses(entity);

    if (__DEV__) {
      console.log({ filters: JSON.stringify(filters) });
      console.log({ restrictions: JSON.stringify(restrictions) });
      console.log({ context });
      console.log({ orderBys });
    }

    const criteria = OBRest.getInstance()
      .createCriteria(entityName)
      .setShowIdentifiers(true)
      .add(restrictions)
      .setFirstResult(pageOffset)
      .setMaxResults(pageSize)
      .setAdditionalParameters({ tabId: currentTab.id, ...context });
    orderBys.forEach(clause => criteria.addOrderBy(clause.name, clause.asc));
    return await criteria.list();
  }

  static getOrderByClauses(entity: IOBDalEntity) {
    let orderByClause: string;
    let orderCriteria: IOBDalOrderCriteria[] = [];
    const { hqlOrderByClause } = entity;

    if (hqlOrderByClause) {
      orderByClause = hqlOrderByClause.replace(/\be\./g, "");
    } else {
      orderByClause = DEFAULT_ORDER_BY;
    }

    orderByClause.split(",").forEach(propAsc => {
      const parts = propAsc.trim().split(" ");
      const prop = parts[0];
      const asc =
        parts.length > 1 && parts[parts.length - 1].toLowerCase() === "desc"
          ? false
          : true;
      if (prop) {
        orderCriteria.push({ name: prop, asc: asc });
      }
    });

    return orderCriteria;
  }

  static getRestrictions(
    entity: IOBDalEntity,
    isSalesTransaction: boolean,
    currentTab: ADTab,
    parentRecordId: string,
    currentRecordId: string,
    filters: FilterValue[]
  ): Criterion {
    const { parentColumns } = entity;

    let mainRestrictions = [
      Restrictions.equals(
        "client",
        OBRest.getInstance()
          .getOBContext()
          ?.getClientId()
      )
    ];
    let subRestrictions = [Restrictions.equals("1", "1")];

    // Filter by sales transaction when needed
    const salesTrxField = currentTab.fields.isSalesTransaction;
    if (salesTrxField) {
      mainRestrictions.push(
        Restrictions.equals(
          salesTrxField.columnName,
          isSalesTransaction.toString()
        )
      );
    }

    // Filter via parent record variable in sub tabs
    if (parentRecordId && parentColumns && parentColumns.length > 0) {
      const allParents = parentColumns.map(column => {
        return Restrictions.equals(column, parentRecordId);
      });

      subRestrictions.push(...allParents);
    }

    if (filters && filters.length > 0) {
      //If there is only 1 filter and its the _identifier, directly insert the restriction
      if (filters.length === 1 && filters[0].fieldID === "_identifier") {
        mainRestrictions.push(
          Restrictions.iContains("_identifier", filters[0].value)
        );
      } else {
        // Group filters by Field ID. This allows to use the OR operator between filters of the same field
        // But keeping an AND operator between all filters.
        let groupedFilters = filters.reduce((groups, filter) => {
          var group = filter.fieldID;

          groups[group] = groups[group] || [];
          groups[group].push(filter);
          return groups;
        }, {} as { [key: string]: FilterValue[] });

        const groupedRestrictions = Object.keys(groupedFilters).map(fieldId => {
          return Restrictions.or(
            groupedFilters[fieldId].map(filter => {
              // Only use case insensitive contains on string type fields
              // For types that are a reference to another entity, search via its identifier
              const filterProperty = locale.t(filter.propertyType);

              switch (filterProperty) {
                case "Search":
                case "Table":
                case "TableDir":
                case "OBUISEL_Selector Reference":
                  return filter.isSearchBar
                    ? Restrictions.iContains(
                        `${filter.property}._identifier`,
                        filter.value
                      )
                    : Restrictions.equals(filter.property, filter.value);

                case "String":
                case "Text":
                  return Restrictions.iContains(filter.property, filter.value);

                default:
                  return Restrictions.equals(filter.property, filter.value);
              }
            })
          );
        });
        mainRestrictions.push(...groupedRestrictions);
      }
    }

    if (currentRecordId) {
      mainRestrictions.push(Restrictions.equals("id", currentRecordId));
    }

    const finalRestrictions: Criterion[] = [
      Restrictions.and(mainRestrictions),
      Restrictions.or(subRestrictions)
    ];

    //                  mainRestrictions                                       subRestrictions
    // (documentStatus == 'CO' and salesTransaction == true) and (parentColumn1 = 'ABC' or parentColumn2 = 'ABC')
    return Restrictions.and(finalRestrictions);
  }

  static async refresh(entity: IRecord) {
    const criteria = OBRest.getInstance()
      .createCriteria(entity._entityName)
      .setShowIdentifiers(true)
      .add(Restrictions.equals("id", entity.id))
      .setMaxResults(1);
    return await criteria.uniqueResult();
  }
}

export { OBDal };
