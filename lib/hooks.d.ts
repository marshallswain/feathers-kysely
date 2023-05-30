import { HookContext } from '@feathersjs/feathers';
import { Knex } from 'knex';
export declare const getKnex: (context: HookContext) => Knex;
export declare const start: () => (context: HookContext) => Promise<void>;
export declare const end: () => (context: HookContext) => any;
export declare const rollback: () => (context: HookContext) => any;
