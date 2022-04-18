"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = void 0;
var chunkArray = function (myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunk_size) {
        // Do something if you want with the group
        tempArray.push(myArray.slice(index, index + chunk_size));
    }
    return tempArray;
};
exports.chunkArray = chunkArray;
