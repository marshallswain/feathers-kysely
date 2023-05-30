import { Kysely } from 'kysely'
import { AdapterServiceOptions, AdapterParams, AdapterQuery } from '@feathersjs/adapter-commons'

export interface KyselyAdapterOptions extends AdapterServiceOptions {
  Model: Kysely<any>
  /**
   * The table name
   */
  name: string
  dialectType: 'mysql' | 'postgres' | 'sqlite'
}

// export interface KyselyAdapterParams<Q = AdapterQuery, DB extends Database = Database> extends AdapterParams<Q, Partial<KyselyAdapterOptions<DB>> {
// }
export type KyselyAdapterParams<Q extends AdapterQuery = AdapterQuery> = AdapterParams<Q>
