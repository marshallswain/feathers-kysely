"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollback = exports.end = exports.start = exports.getKnex = void 0;
const commons_1 = require("@feathersjs/commons");
const debug = (0, commons_1.createDebug)('feathers-knex-transaction');
const ROLLBACK = { rollback: true };
const getKnex = (context) => {
    var _a;
    const knex = ((_a = context.params) === null || _a === void 0 ? void 0 : _a.knex)
        ? context.params.knex
        : typeof context.service.getModel === 'function' && context.service.getModel(context.params);
    return knex && typeof knex.transaction === 'function' ? knex : undefined;
};
exports.getKnex = getKnex;
const start = () => async (context) => {
    const { transaction } = context.params;
    const parent = transaction;
    const knex = transaction ? transaction.trx : (0, exports.getKnex)(context);
    if (!knex) {
        return;
    }
    return new Promise((resolve, reject) => {
        const transaction = {
            starting: true
        };
        if (parent) {
            transaction.parent = parent;
            transaction.committed = parent.committed;
        }
        else {
            transaction.committed = new Promise((resolve) => {
                transaction.resolve = resolve;
            });
        }
        transaction.starting = true;
        transaction.promise = knex
            .transaction((trx) => {
            transaction.trx = trx;
            transaction.id = Date.now();
            context.params = { ...context.params, transaction };
            debug('started a new transaction %s', transaction.id);
            resolve();
        })
            .catch((error) => {
            if (transaction.starting) {
                reject(error);
            }
            else if (error !== ROLLBACK) {
                throw error;
            }
        });
    });
};
exports.start = start;
const end = () => (context) => {
    const { transaction } = context.params;
    if (!transaction) {
        return;
    }
    const { trx, id, promise, parent } = transaction;
    context.params = { ...context.params, transaction: parent };
    transaction.starting = false;
    return trx
        .commit()
        .then(() => promise)
        .then(() => transaction.resolve && transaction.resolve(true))
        .then(() => debug('ended transaction %s', id))
        .then(() => context);
};
exports.end = end;
const rollback = () => (context) => {
    const { transaction } = context.params;
    if (!transaction) {
        return;
    }
    const { trx, id, promise, parent } = transaction;
    context.params = { ...context.params, transaction: parent };
    transaction.starting = false;
    return trx
        .rollback(ROLLBACK)
        .then(() => promise)
        .then(() => transaction.resolve && transaction.resolve(false))
        .then(() => debug('rolled back transaction %s', id))
        .then(() => context);
};
exports.rollback = rollback;
//# sourceMappingURL=hooks.js.map