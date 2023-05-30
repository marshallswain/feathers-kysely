"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KyselyService = void 0;
const lib_1 = require("@feathersjs/errors/lib");
const adapter_1 = require("./adapter");
__exportStar(require("./declarations"), exports);
__exportStar(require("./adapter"), exports);
__exportStar(require("./error-handler"), exports);
class KyselyService extends adapter_1.KyselyAdapter {
    async find(params) {
        return this._find({
            ...params,
            query: await this.sanitizeQuery(params),
        });
    }
    async get(id, params) {
        return this._get(id, {
            ...params,
            query: await this.sanitizeQuery(params),
        });
    }
    async create(data, params) {
        if (Array.isArray(data) && !this.allowsMulti('create', params)) {
            throw new lib_1.MethodNotAllowed('Can not create multiple entries');
        }
        return this._create(data, params);
    }
    async update(id, data, params) {
        return this._update(id, data, {
            ...params,
            query: await this.sanitizeQuery(params),
        });
    }
    async patch(id, data, params) {
        const { $limit, ...query } = await this.sanitizeQuery(params);
        return this._patch(id, data, {
            ...params,
            query,
        });
    }
    async remove(id, params) {
        const { $limit, ...query } = await this.sanitizeQuery(params);
        return this._remove(id, {
            ...params,
            query,
        });
    }
}
exports.KyselyService = KyselyService;
//# sourceMappingURL=index.js.map