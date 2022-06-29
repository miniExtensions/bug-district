"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
var fs = require("fs");
var path = require("path");
var puppeteer = require("puppeteer");
var transformObjPropertiesToPrintable = function (properties) {
    if (properties == null)
        return "null value";
    if (properties.length == 0)
        return "";
    return JSON.stringify(properties.reduce(function (prev, curr) {
        var _a, _b;
        prev[curr.name] =
            curr.type === "object"
                ? transformObjPropertiesToPrintable((_a = curr.valuePreview) === null || _a === void 0 ? void 0 : _a.properties)
                : (_b = curr.value) !== null && _b !== void 0 ? _b : "undefined value";
        return prev;
    }, {}));
};
var defaultBugDistrictDomain = "https://bug-district.vercel.app";
var pathArg = (_a = process.argv[2]) !== null && _a !== void 0 ? _a : null;
var localhostPort = (_b = process.argv[3]) !== null && _b !== void 0 ? _b : null;
var domainForBugDistrict = (_c = process.argv[4]) !== null && _c !== void 0 ? _c : defaultBugDistrictDomain;
if (!pathArg) {
    throw new Error("Please provide a path to the test suite");
}
if (!localhostPort) {
    throw new Error("Please provide a localhost port");
}
var filePath = path.resolve(pathArg);
var wait = function (milliseconds) {
    return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
};
exports.wait = wait;
new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // @ts-ignore
        fs.readFile(filePath, "utf8", function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
            var testSuite, browser, page, onSuccess, onFailure;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (err) {
                            console.error("Error while reading file: ".concat(filePath, "\n\n") + err);
                            reject(err);
                            return [2 /*return*/];
                        }
                        testSuite = JSON.parse(data);
                        return [4 /*yield*/, puppeteer.launch({
                                dumpio: true,
                                // dumpio: domainForBugDistrict !== defaultBugDistrictDomain ,
                                headless: true,
                            })];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 2:
                        page = _a.sent();
                        return [4 /*yield*/, page.setCacheEnabled(false)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.goto("".concat(domainForBugDistrict, "/run-all-on-ci"))];
                    case 4:
                        _a.sent();
                        onSuccess = function () {
                            console.log("All tests passed.");
                            process.exit(0);
                        };
                        return [4 /*yield*/, page.exposeFunction("onSuccess", onSuccess)];
                    case 5:
                        _a.sent();
                        onFailure = function (errorMessage) {
                            console.error(errorMessage);
                            process.exit(1);
                        };
                        return [4 /*yield*/, page.exposeFunction("onFailure", onFailure)];
                    case 6:
                        _a.sent();
                        // Log the page's logs to make debugging easier
                        page.on("console", function (event) {
                            var _a;
                            try {
                                var data_1 = event.args()[0]._remoteObject;
                                var finalLog = data_1.type === "object"
                                    ? transformObjPropertiesToPrintable((_a = data_1.preview) === null || _a === void 0 ? void 0 : _a.properties)
                                    : event.text();
                                console.log(finalLog);
                            }
                            catch (error) {
                                console.log(event.args());
                            }
                        });
                        return [4 /*yield*/, page.evaluate(function (_a) {
                                var testSuite = _a.testSuite, localhostPort = _a.localhostPort;
                                var message = {
                                    source: "ui-tester",
                                    type: "run-test-suite-on-ci",
                                    domainUrl: "http://localhost:".concat(localhostPort),
                                    jsonContent: JSON.stringify(testSuite),
                                };
                                window.postMessage(message, "*");
                                window.addEventListener("message", function (event) {
                                    if (event.data.source != "ui-tester") {
                                        return;
                                    }
                                    if (event.data.type === "test-suite-success-on-ci") {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        var message_1 = event.data;
                                        // @ts-ignore
                                        onSuccess();
                                    }
                                    else if (event.data.type === "test-suite-failure-on-ci") {
                                        var message_2 = event.data;
                                        // @ts-ignore
                                        onFailure(message_2.error);
                                    }
                                });
                            }, { testSuite: testSuite, localhostPort: localhostPort })];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
