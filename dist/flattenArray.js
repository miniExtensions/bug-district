"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenArray = void 0;
var flattenArray = function (arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? (0, exports.flattenArray)(toFlatten) : toFlatten);
    }, []);
};
exports.flattenArray = flattenArray;
