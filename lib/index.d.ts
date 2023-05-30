import { PaginationOptions } from '@feathersjs/adapter-commons';
import { Paginated, ServiceMethods, Id, NullableId, Params } from '@feathersjs/feathers';
import { KnexAdapter } from './adapter';
import { KnexAdapterParams } from './declarations';
export * from './declarations';
export * from './adapter';
export * from './error-handler';
export * as transaction from './hooks';
export declare class KnexService<Result = any, Data = Partial<Result>, ServiceParams extends Params<any> = KnexAdapterParams, PatchData = Partial<Data>> extends KnexAdapter<Result, Data, ServiceParams, PatchData> implements ServiceMethods<Result | Paginated<Result>, Data, ServiceParams, PatchData> {
    find(params?: ServiceParams & {
        paginate?: PaginationOptions;
    }): Promise<Paginated<Result>>;
    find(params?: ServiceParams & {
        paginate: false;
    }): Promise<Result[]>;
    find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>;
    get(id: Id, params?: ServiceParams): Promise<Result>;
    create(data: Data, params?: ServiceParams): Promise<Result>;
    create(data: Data[], params?: ServiceParams): Promise<Result[]>;
    create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]>;
    update(id: Id, data: Data, params?: ServiceParams): Promise<Result>;
    patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>;
    patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>;
    patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]>;
    remove(id: Id, params?: ServiceParams): Promise<Result>;
    remove(id: null, params?: ServiceParams): Promise<Result[]>;
    remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]>;
}
