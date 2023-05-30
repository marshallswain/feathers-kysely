import { Kysely } from 'kysely';
import { AdapterServiceOptions, AdapterParams, AdapterQuery } from '@feathersjs/adapter-commons';
export interface KyselyAdapterOptions extends AdapterServiceOptions {
    Model: Kysely<any>;
    /**
     * The table name
     */
    name: string;
    dialectType: 'mysql' | 'postgres' | 'sqlite';
}
export type KyselyAdapterParams<Q extends AdapterQuery = AdapterQuery> = AdapterParams<Q>;
