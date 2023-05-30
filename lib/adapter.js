"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KyselyAdapter = void 0;
const commons_1 = require("@feathersjs/commons");
const adapter_commons_1 = require("@feathersjs/adapter-commons");
const errors_1 = require("@feathersjs/errors");
const error_handler_1 = require("./error-handler");
// See https://kysely-org.github.io/kysely/variables/OPERATORS.html
const OPERATORS = {
    $lt: '<',
    $lte: '<=',
    $gt: '>',
    $gte: '>=',
    $like: 'like',
    $notlike: 'not like',
    $ilike: 'ilike',
    $in: 'in',
    $nin: 'not in',
    $ne: '!=',
};
// const RETURNING_CLIENTS = ['postgresql', 'pg', 'oracledb', 'mssql']
class KyselyAdapter extends adapter_commons_1.AdapterBase {
    constructor(options) {
        if (!options || !options.Model) {
            throw new Error('You must provide a Kysely instance to the `Model` option');
        }
        if (typeof options.name !== 'string') {
            throw new Error('No table name specified.');
        }
        super({
            id: 'id',
            ...options,
            filters: {
                ...options.filters,
                $and: (value) => value,
            },
            operators: [...(options.operators || []), '$like', '$notlike', '$ilike'],
        });
    }
    // get fullName() {
    //   const { name, schema } = this.getOptions({} as ServiceParams)
    //   return schema ? `${schema}.${name}` : name
    // }
    get Model() {
        return this.getModel();
    }
    getModel(params = {}) {
        const { Model } = this.getOptions(params);
        return Model;
    }
    filterQuery(params) {
        const options = this.getOptions(params);
        const { $select, $sort, $limit: _limit, $skip = 0, ...query } = (params.query || {});
        const $limit = $skip ? (0, adapter_commons_1.getLimit)(_limit, options.paginate) || -1 : (0, adapter_commons_1.getLimit)(_limit, options.paginate);
        return {
            paginate: options.paginate,
            filters: { $select, $sort, $limit, $skip },
            query: this.convertValues(query),
        };
    }
    createQuery(options, filters, query) {
        const q = this.startSelectQuery(options, filters);
        const qWhere = this.applyWhere(q, query);
        const qLimit = filters.$limit ? qWhere.limit(filters.$limit) : qWhere;
        const qSkip = filters.$skip ? qLimit.offset(filters.$skip) : qLimit;
        const qSorted = this.applySort(qSkip, filters);
        const compiled = qSorted.compile();
        return qSorted;
    }
    startSelectQuery(options, filters) {
        const { name, id: idField } = options;
        const q = this.Model.selectFrom(name);
        return filters.$select ? q.select(filters.$select.concat(idField)) : q.selectAll();
    }
    createCountQuery(params) {
        const options = this.getOptions(params);
        const { id: idField } = options;
        const { filters, query } = this.filterQuery(params);
        const q = this.startSelectQuery(options, filters);
        const qWhere = this.applyWhere(q, query);
        const qSorted = this.applySort(qWhere, filters);
        // count
        const countParams = this.Model.fn.count(idField).as('total');
        return qSorted.select(countParams);
    }
    applyWhere(q, query) {
        // loop through params and call the where filters
        return Object.entries(query).reduce((q, [key, value]) => {
            // if (key === '$or') {
            //   return value.reduce((q: Q, subParams: Query) => {
            //     return q.orWhere((subQ: Q) => this.applyWhere(subQ, subParams))
            //   }, q)
            // } else
            if (['$and', '$or'].includes(key)) {
                return q.where((qb) => {
                    return this.handleAndOr(qb, key, value);
                });
            }
            else if (commons_1._.isObject(value)) {
                // loop through OPERATORS and apply them
                const qOperators = Object.entries(OPERATORS).reduce((q, [operator, op]) => {
                    if (value === null || value === void 0 ? void 0 : value.hasOwnProperty(operator)) {
                        const val = value[operator];
                        if (val === null) {
                            const nullOperator = operator === '$ne' ? 'is not' : 'is';
                            return q.where(key, nullOperator, val);
                        }
                        else
                            return q.where(key, op, value[operator]);
                    }
                    return q;
                }, q);
                return qOperators;
            }
            else {
                if (value === null)
                    return q.where(key, 'is', value);
                else
                    return q.where(key, '=', value);
            }
        }, q);
    }
    handleAndOr(qb, key, value) {
        const method = qb[key.replace('$', '')];
        const subs = value.map((subParams) => {
            return this.handleSubQuery(qb, subParams);
        });
        return method(subs);
    }
    handleSubQuery(qb, query) {
        return qb.and(Object.entries(query).map(([key, value]) => {
            if (['$and', '$or'].includes(key)) {
                return this.handleAndOr(qb, key, value);
            }
            else if (commons_1._.isObject(value)) {
                // loop through OPERATORS and apply them
                return qb.and(Object.entries(OPERATORS)
                    .filter(([operator, op]) => {
                    return value === null || value === void 0 ? void 0 : value.hasOwnProperty(operator);
                })
                    .map(([operator, op]) => {
                    const val = value[operator];
                    return this.whereCompare(qb, key, op, val);
                }));
            }
            else {
                return this.whereCompare(qb, key, '=', value);
            }
        }));
    }
    whereCompare(qb, key, operator, value) {
        if (value === null) {
            const nullOperator = operator === '$ne' ? 'is not' : 'is';
            return qb.cmpr(key, nullOperator, value);
        }
        else
            return qb.cmpr(key, operator, value);
    }
    applySort(q, filters) {
        return Object.entries(filters.$sort || {}).reduce((q, [key, value]) => {
            return q.orderBy(key, value === 1 ? 'asc' : 'desc');
        }, q);
    }
    /**
     * Add a returning statement alias for each key (bypasses bug in sqlite)
     * @param q kysely query builder
     * @param data data which is expected to be returned
     */
    applyReturning(q, keys) {
        return keys.reduce((q, key) => {
            return q.returning(`${key} as ${key}`);
        }, q.returningAll());
    }
    convertValues(data) {
        if (this.options.dialectType !== 'sqlite')
            return data;
        // convert booleans to 0 or 1
        return Object.entries(data).reduce((data, [key, value]) => {
            if (typeof value === 'boolean') {
                return { ...data, [key]: value ? 1 : 0 };
            }
            return data;
        }, data);
    }
    async _find(params = {}) {
        const { filters, query, paginate } = this.filterQuery(params);
        const options = this.getOptions(params);
        const q = this.createQuery(options, filters, query);
        if (paginate && paginate.default) {
            const countQuery = this.createCountQuery(params);
            try {
                const [queryResult, countQueryResult] = await Promise.all([q.execute(), countQuery.execute()]);
                const data = filters.$limit === 0 ? [] : queryResult;
                const total = countQueryResult[0].total;
                return {
                    total,
                    limit: filters.$limit,
                    skip: filters.$skip || 0,
                    data: data,
                };
            }
            catch (error) {
                (0, error_handler_1.errorHandler)(error);
            }
        }
        try {
            const data = filters.$limit === 0 ? [] : await q.execute();
            return data;
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error);
        }
    }
    /**
     * Retrieve a single record by id
     * See https://kysely-org.github.io/kysely/classes/SelectQueryBuilder.html
     */
    async _get(id, params = {}) {
        const options = this.getOptions(params);
        const { name, id: idField } = options;
        const { filters, query } = this.filterQuery(params);
        if (id != null && query[idField] != null)
            throw new errors_1.NotFound();
        const q = this.startSelectQuery(options, filters);
        const qWhere = this.applyWhere(q, { [idField]: id, ...query });
        const compiled = qWhere.compile();
        try {
            const item = await qWhere.executeTakeFirst();
            if (!item)
                throw new errors_1.NotFound(`No record found for ${idField} '${id}'`);
            return item;
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error);
        }
    }
    async _create(_data, params = {}) {
        var _a, _b;
        const { name, id: idField } = this.getOptions(params);
        const { filters } = this.filterQuery(params);
        const isArray = Array.isArray(_data);
        const $select = ((_a = filters.$select) === null || _a === void 0 ? void 0 : _a.length) ? filters.$select.concat(idField) : undefined;
        const convertedData = isArray ? _data.map((i) => this.convertValues(i)) : [this.convertValues(_data)];
        const q = this.Model.insertInto(name).values(convertedData);
        const qReturning = this.applyReturning(q, Object.keys(convertedData[0]));
        const compiled = qReturning.compile();
        const request = isArray ? qReturning.execute() : qReturning.executeTakeFirst();
        try {
            const response = await request;
            const toReturn = ((_b = filters.$select) === null || _b === void 0 ? void 0 : _b.length)
                ? isArray
                    ? response.map((i) => commons_1._.pick(i, ...$select))
                    : commons_1._.pick(response, ...$select)
                : response;
            return toReturn;
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error);
        }
    }
    async _patch(id, _data, params = {}) {
        var _a, _b, _c;
        if (id === null && !this.allowsMulti('patch', params)) {
            throw new errors_1.MethodNotAllowed('Can not patch multiple entries');
        }
        const asMulti = id === null;
        const { name, id: idField } = this.getOptions(params);
        const { filters, query } = this.filterQuery(params);
        const $select = ((_a = filters.$select) === null || _a === void 0 ? void 0 : _a.length) ? filters.$select.concat(idField) : undefined;
        if (id != null && query[idField] != null)
            throw new errors_1.NotFound();
        const q = this.Model.updateTable(name).set(commons_1._.omit(_data, idField));
        const qWhere = this.applyWhere(q, asMulti ? query : id == null ? query : { [idField]: id, ...query });
        const toSelect = ((_b = filters.$select) === null || _b === void 0 ? void 0 : _b.length) ? filters.$select : Object.keys(_data);
        const qReturning = this.applyReturning(qWhere, toSelect.concat(idField));
        const compiled = qReturning.compile();
        const request = asMulti ? qReturning.execute() : qReturning.executeTakeFirst();
        try {
            const response = await request;
            if (!asMulti && !response) {
                throw new errors_1.NotFound(`No record found for ${idField} '${id}'`);
            }
            const toReturn = ((_c = filters.$select) === null || _c === void 0 ? void 0 : _c.length)
                ? Array.isArray(response)
                    ? response.map((i) => commons_1._.pick(i, ...$select))
                    : commons_1._.pick(response, ...$select)
                : response;
            return toReturn;
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error);
        }
    }
    async _update(id, _data, params = {}) {
        if (id === null || Array.isArray(_data)) {
            throw new errors_1.BadRequest("You can not replace multiple instances. Did you mean 'patch'?");
        }
        const data = commons_1._.omit(_data, this.id);
        const oldData = await this._get(id, params);
        // New data changes all fields except id
        const newObject = Object.keys(oldData).reduce((result, key) => {
            if (key !== this.id) {
                result[key] = data[key] === undefined ? null : data[key];
            }
            return result;
        }, {});
        const result = await this._patch(id, newObject, params);
        return result;
    }
    async _remove(id, params = {}) {
        if (id === null && !this.allowsMulti('remove', params)) {
            throw new errors_1.MethodNotAllowed('Cannot remove multiple entries');
        }
        params.paginate = false;
        const originalData = id === null ? await this._find(params) : await this._get(id, params);
        const { name, id: idField } = this.getOptions(params);
        const q = this.Model.deleteFrom(name);
        const convertedQuery = this.convertValues(id === null ? params.query : { [idField]: id });
        const qWhere = this.applyWhere(q, convertedQuery);
        const compiled = qWhere.compile();
        const request = id === null ? qWhere.execute() : qWhere.executeTakeFirst();
        try {
            const result = await request;
            if (!result)
                throw new errors_1.NotFound(`No record found for id '${id}'`);
            return originalData;
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error);
        }
    }
}
exports.KyselyAdapter = KyselyAdapter;
//# sourceMappingURL=adapter.js.map