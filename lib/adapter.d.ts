import { Id, NullableId, Paginated, Query } from '@feathersjs/feathers';
import { AdapterBase, PaginationOptions } from '@feathersjs/adapter-commons';
import { KyselyAdapterOptions, KyselyAdapterParams } from './declarations';
import { DeleteQueryBuilder, DeleteResult, InsertQueryBuilder, InsertResult, SelectQueryBuilder, UpdateQueryBuilder, UpdateResult } from 'kysely';
type DeleteOrInsertBuilder = DeleteQueryBuilder<any, string, DeleteResult> | InsertQueryBuilder<any, string, InsertResult> | UpdateQueryBuilder<any, string, string, UpdateResult>;
export declare class KyselyAdapter<Result, Data = Partial<Result>, ServiceParams extends KyselyAdapterParams<any> = KyselyAdapterParams, PatchData = Partial<Data>> extends AdapterBase<Result, Data, PatchData, ServiceParams, KyselyAdapterOptions> {
    schema?: string;
    constructor(options: KyselyAdapterOptions);
    get Model(): import("kysely").Kysely<any>;
    getModel(params?: ServiceParams): import("kysely").Kysely<any>;
    filterQuery(params: ServiceParams): {
        paginate: import("@feathersjs/feathers").PaginationParams;
        filters: {
            $select: string[];
            $sort: {
                [key: string]: 1 | -1;
            };
            $limit: number;
            $skip: number;
        };
        query: Record<string, any>;
    };
    createQuery(options: KyselyAdapterOptions, filters: any, query: any): SelectQueryBuilder<any, string, {}>;
    startSelectQuery(options: KyselyAdapterOptions, filters: any): SelectQueryBuilder<any, string, import("kysely").Selection<any, string, any>>;
    createCountQuery(params: ServiceParams): SelectQueryBuilder<any, string, import("kysely").Selection<any, string, import("kysely").AliasedAggregateFunctionBuilder<any, string | number | symbol, string | number | bigint, "total">>>;
    applyWhere<Q extends Record<string, any>>(q: Q, query: Query): Q;
    handleAndOr(qb: any, key: string, value: Query[]): any;
    handleSubQuery(qb: any, query: Query): any;
    whereCompare(qb: any, key: string, operator: any, value: any): any;
    applySort<Q extends SelectQueryBuilder<any, string, {}>>(q: Q, filters: any): SelectQueryBuilder<any, string, {}>;
    /**
     * Add a returning statement alias for each key (bypasses bug in sqlite)
     * @param q kysely query builder
     * @param data data which is expected to be returned
     */
    applyReturning<Q extends DeleteOrInsertBuilder>(q: Q, keys: string[]): DeleteQueryBuilder<any, string, import("kysely/dist/cjs/parser/select-parser").AllSelection<any, string>> | InsertQueryBuilder<any, string, import("kysely").Selectable<any>> | UpdateQueryBuilder<any, string, string, import("kysely").Selectable<any>>;
    convertValues(data: Record<string, any>): Record<string, any>;
    /**
     * Retrieve records matching the query
     * See https://kysely-org.github.io/kysely/classes/SelectQueryBuilder.html
     * @param params
     */
    _find(params?: ServiceParams & {
        paginate?: PaginationOptions;
    }): Promise<Paginated<Result>>;
    _find(params?: ServiceParams & {
        paginate: false;
    }): Promise<Result[]>;
    _find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>;
    /**
     * Retrieve a single record by id
     * See https://kysely-org.github.io/kysely/classes/SelectQueryBuilder.html
     */
    _get(id: Id, params?: ServiceParams): Promise<Result>;
    /**
     * Create a single record
     * See https://kysely-org.github.io/kysely/classes/InsertQueryBuilder.html
     * @param data
     * @param params
     */
    _create(data: Data, params?: ServiceParams): Promise<Result>;
    _create(data: Data[], params?: ServiceParams): Promise<Result[]>;
    _create(data: Data | Data[], _params?: ServiceParams): Promise<Result | Result[]>;
    /**
     * Patch a single record by id
     * See https://kysely-org.github.io/kysely/classes/UpdateQueryBuilder.html
     * @param id
     * @param data
     * @param params
     */
    _patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>;
    _patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>;
    _patch(id: NullableId, data: PatchData, _params?: ServiceParams): Promise<Result | Result[]>;
    _update(id: Id, _data: Data, params?: ServiceParams): Promise<Result>;
    /**
     * Remove a single record by id
     * See https://kysely-org.github.io/kysely/classes/DeleteQueryBuilder.html
     * @param id
     * @param params
     */
    _remove(id: null, params?: ServiceParams): Promise<Result[]>;
    _remove(id: Id, params?: ServiceParams): Promise<Result>;
    _remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]>;
}
export {};
