import { Id, NullableId, Paginated, Query } from '@feathersjs/feathers';
import { AdapterBase, PaginationOptions } from '@feathersjs/adapter-commons';
import { Knex } from 'knex';
import { KnexAdapterOptions, KnexAdapterParams } from './declarations';
export declare class KnexAdapter<Result, Data = Partial<Result>, ServiceParams extends KnexAdapterParams<any> = KnexAdapterParams, PatchData = Partial<Data>> extends AdapterBase<Result, Data, PatchData, ServiceParams, KnexAdapterOptions> {
    schema?: string;
    constructor(options: KnexAdapterOptions);
    get fullName(): string;
    get Model(): Knex<any, any[]>;
    getModel(params?: ServiceParams): Knex<any, any[]>;
    db(params?: ServiceParams): Knex.QueryBuilder<any, any>;
    knexify(knexQuery: Knex.QueryBuilder, query?: Query, parentKey?: string): Knex.QueryBuilder;
    createQuery(params?: ServiceParams): Knex.QueryBuilder<any, any>;
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
        query: {
            [key: string]: any;
        };
    };
    _find(params?: ServiceParams & {
        paginate?: PaginationOptions;
    }): Promise<Paginated<Result>>;
    _find(params?: ServiceParams & {
        paginate: false;
    }): Promise<Result[]>;
    _find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>;
    _findOrGet(id: NullableId, params?: ServiceParams): Promise<Result[]>;
    _get(id: Id, params?: ServiceParams): Promise<Result>;
    _create(data: Data, params?: ServiceParams): Promise<Result>;
    _create(data: Data[], params?: ServiceParams): Promise<Result[]>;
    _create(data: Data | Data[], _params?: ServiceParams): Promise<Result | Result[]>;
    _patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>;
    _patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>;
    _patch(id: NullableId, data: PatchData, _params?: ServiceParams): Promise<Result | Result[]>;
    _update(id: Id, _data: Data, params?: ServiceParams): Promise<Result>;
    _remove(id: null, params?: ServiceParams): Promise<Result[]>;
    _remove(id: Id, params?: ServiceParams): Promise<Result>;
    _remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]>;
}
