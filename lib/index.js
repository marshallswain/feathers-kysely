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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnexService = exports.transaction = void 0;
const lib_1 = require("@feathersjs/errors/lib");
const adapter_1 = require("./adapter");
__exportStar(require("./declarations"), exports);
__exportStar(require("./adapter"), exports);
__exportStar(require("./error-handler"), exports);
exports.transaction = __importStar(require("./hooks"));
class KnexService extends adapter_1.KnexAdapter {
    async find(params) {
        return this._find({
            ...params,
            query: await this.sanitizeQuery(params)
        });
    }
    async get(id, params) {
        return this._get(id, {
            ...params,
            query: await this.sanitizeQuery(params)
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
            query: await this.sanitizeQuery(params)
        });
    }
    async patch(id, data, params) {
        const { $limit, ...query } = await this.sanitizeQuery(params);
        return this._patch(id, data, {
            ...params,
            query
        });
    }
    async remove(id, params) {
        const { $limit, ...query } = await this.sanitizeQuery(params);
        return this._remove(id, {
            ...params,
            query
        });
    }
}
exports.KnexService = KnexService;
//# sourceMappingURL=index.js.map