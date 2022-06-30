"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTestActions = void 0;
var flattenArray_1 = require("./flattenArray");
var deleteAllCookies = function () {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name_1 = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name_1 + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
};
var cleanup = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dbs, _i, dbs_1, db;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                localStorage.clear();
                deleteAllCookies();
                sessionStorage.clear();
                return [4 /*yield*/, window.indexedDB.databases()];
            case 1:
                dbs = _a.sent();
                for (_i = 0, dbs_1 = dbs; _i < dbs_1.length; _i++) {
                    db = dbs_1[_i];
                    // @ts-ignore
                    window.indexedDB.deleteDatabase(db.name);
                }
                return [2 /*return*/];
        }
    });
}); };
// KEEP THIS IN SYNC WITH LIBRARY
var NATIVE_ACTION_ID_PREFIX = "NATIVE_ACTION_ID_";
// KEEP THIS IN SYNC WITH WEBSITE
var makeNativeActionIdWithPrefix = function (id) {
    return "".concat(NATIVE_ACTION_ID_PREFIX).concat(id);
};
// KEEP THIS IN SYNC WITH WEBSITE
var NATIVE_ADVANCED_ARG_ID_PREFIX = "NATIVE_ADVANCED_ARG_ID_";
// KEEP THIS IN SYNC WITH WEBSITE
var makeNativeAdvancedArgIdWithPrefix = function (id) {
    return "".concat(NATIVE_ADVANCED_ARG_ID_PREFIX).concat(id);
};
var dispatchActionFailedEvent = function (args) {
    var message = {
        source: "ui-tester",
        type: "test-failed",
        actionIndex: args.actionIndex,
        errorMessage: args.errorMessage,
    };
    var parentWindow = window.parent;
    if (parentWindow) {
        parentWindow.postMessage(message, "*");
    }
    else {
        throw new Error("Could not find a parent window to post message to.");
    }
};
var dispatchTestSucceededEvent = function () { return __awaiter(void 0, void 0, void 0, function () {
    var message, parentWindow;
    return __generator(this, function (_a) {
        message = {
            source: "ui-tester",
            type: "test-succeeded",
        };
        parentWindow = window.parent;
        if (parentWindow) {
            parentWindow.postMessage(message, "*");
        }
        else {
            throw new Error("Could not find a parent window to post message to.");
        }
        return [2 /*return*/];
    });
}); };
var dispatchTestActionSuccessMessage = function (nextActionIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var message, parentWindow;
    return __generator(this, function (_a) {
        message = {
            source: "ui-tester",
            type: "test-action-succeeded",
            nextActionIndex: nextActionIndex,
        };
        parentWindow = window.parent;
        if (parentWindow) {
            parentWindow.postMessage(message, "*");
        }
        else {
            throw new Error("Could not find a parent window to post message to.");
        }
        return [2 /*return*/];
    });
}); };
var dispatchTestActionStoppedMessage = function (actionIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var message, parentWindow;
    return __generator(this, function (_a) {
        message = {
            source: "ui-tester",
            type: "test-action-stopped",
            actionIndex: actionIndex,
        };
        parentWindow = window.parent;
        if (parentWindow) {
            parentWindow.postMessage(message, "*");
        }
        else {
            throw new Error("Could not find a parent window to post message to.");
        }
        return [2 /*return*/];
    });
}); };
var dispatchMessageToSetGlobalsOnLastRun = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var message, parentWindow;
    return __generator(this, function (_a) {
        message = {
            source: "ui-tester",
            type: "set-globals-on-last-run",
            globalsOnLastRun: args.globalsOnLastRun,
            actionIndex: args.actionIndex,
            generatedActions: args.generatedActions,
        };
        parentWindow = window.parent;
        if (parentWindow) {
            parentWindow.postMessage(message, "*");
        }
        else {
            throw new Error("Could not find a parent window to post message to.");
        }
        return [2 /*return*/];
    });
}); };
var dispatchActionForAvailableActions = function (actionRunners, globalState) {
    var message = {
        source: "ui-tester",
        type: "available-actions",
        actions: actionRunners.map(function (runner) {
            return {
                id: runner.id,
                label: runner.label,
                arguments: runner.arguments,
                enableNativeAdvancedOptions: runner.enableNativeAdvancedOptions,
                requiresOneOf: runner.requiresOneOf || null,
                maxDurationInSeconds: runner.maxDurationInSeconds || null,
            };
        }),
    };
    var parentWindow = window.parent;
    if (parentWindow) {
        parentWindow.postMessage(message, "*");
        setTimeout(function () {
            if (!globalState.parentWindowRecievedAvailableAction) {
                // Retry
                dispatchActionForAvailableActions(actionRunners, globalState);
            }
        }, 500);
    }
    else {
        throw new Error("Could not find a parent window to post message to.");
    }
};
var initTest = function (actionRunnersFromUser) {
    if (typeof window !== "undefined" &&
        process.env.JEST_WORKER_ID == null &&
        process.env.NODE_ENV === "development") {
        var jestExpect = require("expect");
        // We override the global expect here.
        // @ts-ignore
        window.expect = jestExpect;
        // @ts-ignore
        global.expect = jestExpect;
        require("@testing-library/jest-dom");
        var eventMethod = Boolean(window.addEventListener)
            ? "addEventListener"
            : "attachEvent";
        // @ts-ignore
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        var globalState_1 = {
            currentRunningTestState: null,
            parentWindowRecievedAvailableAction: false,
        };
        var failAtCurrentAction_1 = function (errorMessage) {
            var currentRunningTestState = globalState_1.currentRunningTestState;
            if (!currentRunningTestState ||
                currentRunningTestState.status.type !== "running") {
                throw new Error("failAtCurrentAction called when not in running state.");
            }
            var currentActionIndex = currentRunningTestState.status.currentActionIndex;
            var newStatus = {
                type: "failure",
                failedActionIndex: currentActionIndex,
                errorMessage: errorMessage,
            };
            dispatchActionSetMostRecentTestState_1({
                state: __assign(__assign({}, currentRunningTestState), { status: newStatus }),
            });
            console.log("FAILED ACTION ERROR MESSAGE: ".concat(errorMessage));
            dispatchActionFailedEvent({
                errorMessage: errorMessage,
                actionIndex: currentActionIndex,
            });
        };
        var dispatchActionSetMostRecentTestState_1 = function (args) { return __awaiter(void 0, void 0, void 0, function () {
            var message, parentWindow;
            return __generator(this, function (_a) {
                globalState_1.currentRunningTestState = args.state;
                message = {
                    source: "ui-tester",
                    type: "set-most-recent-state",
                    state: args.state,
                };
                parentWindow = window.parent;
                if (parentWindow) {
                    parentWindow.postMessage(message, "*");
                }
                else {
                    throw new Error("Could not find a parent window to post message to.");
                }
                return [2 /*return*/];
            });
        }); };
        eventer(messageEvent, function (e) { return __awaiter(void 0, void 0, void 0, function () {
            var actions, disableGenerators, stopAtActionIndex, delayBetweenActionsInMS, state, currentRunningTestState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!e.data)
                            return [2 /*return*/];
                        if (!(e && e.data && e.data.source === "ui-tester")) return [3 /*break*/, 3];
                        console.log("TEST DATA::", e.data);
                        if (!(e.data.type === "start-test" && e.data.actions)) return [3 /*break*/, 2];
                        actions = e.data.actions;
                        disableGenerators = e.data.disableGenerators;
                        stopAtActionIndex = e.data.stopAtActionIndex;
                        delayBetweenActionsInMS = e.data
                            .delayBetweenActionsInMS;
                        return [4 /*yield*/, cleanup()];
                    case 1:
                        _a.sent();
                        state = {
                            status: {
                                type: "running",
                                currentActionIndex: 0,
                                onlyRunNextActionAfterURLPathBecomes: null,
                                stopAtActionIndex: stopAtActionIndex,
                                testWasStartedAt: Date.now(),
                            },
                            actions: actions,
                            delayBetweenActionsInMS: delayBetweenActionsInMS,
                            globals: {},
                            disableGenerators: disableGenerators,
                        };
                        dispatchActionSetMostRecentTestState_1({ state: state });
                        processNextAction_1();
                        return [3 /*break*/, 3];
                    case 2:
                        if (e.data.type === "did-recieve-available-actions") {
                            currentRunningTestState = e.data
                                .mostRecentState;
                            globalState_1.parentWindowRecievedAvailableAction = true;
                            dispatchActionSetMostRecentTestState_1({
                                state: currentRunningTestState,
                            });
                            if (globalState_1.currentRunningTestState &&
                                globalState_1.currentRunningTestState.status.type === "running") {
                                processNextAction_1();
                            }
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); }, false);
        var goToURLPathNativeAction = {
            id: makeNativeActionIdWithPrefix("goToURLPath"),
            label: "Go to URL Path",
            arguments: [
                {
                    id: "path",
                    label: "URL Path",
                    subtitle: "e.g. /settings",
                },
            ],
            run: function (data) { return __awaiter(void 0, void 0, void 0, function () {
                var path;
                return __generator(this, function (_a) {
                    path = data.args.path;
                    window.location.href = path;
                    return [2 /*return*/, {
                            onlyRunNextActionAfterURLPathBecomes: path,
                        }];
                });
            }); },
        };
        var actionRunners_1 = __spreadArray([
            goToURLPathNativeAction
        ], actionRunnersFromUser, true);
        dispatchActionForAvailableActions(actionRunners_1, globalState_1);
        var wait_1 = function (milliseconds) {
            return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); });
        };
        var processNextAction_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentRunningTestState, currentActionIndex, currentAction, isLastAction, actionRunner, waitForURLToBe, pathWithoutDomain, timeoutState, modifiersResult, result, actionGenerators, actionRunnerIdsToRunners_1, _i, actionGenerators_1, generator, generatedActions, mostRecentTestState, currentActionIndex_1, shouldStopAtCurrentIndex, nextActionIndex, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentRunningTestState = globalState_1.currentRunningTestState;
                        if (!currentRunningTestState ||
                            currentRunningTestState.status.type !== "running") {
                            throw new Error("processNextAction called when not in running state.");
                        }
                        currentActionIndex = currentRunningTestState.status.currentActionIndex;
                        console.log("Running action at index", currentActionIndex);
                        currentAction = currentRunningTestState.actions[currentActionIndex];
                        isLastAction = currentActionIndex === currentRunningTestState.actions.length - 1;
                        actionRunner = actionRunners_1.find(function (actionRunner) { return currentAction.id === actionRunner.id; });
                        if (!actionRunner) {
                            failAtCurrentAction_1("No action runner found for action with id ".concat(currentAction.id, "."));
                            return [2 /*return*/];
                        }
                        // Set default values
                        actionRunner.arguments.map(function (actionArg) {
                            var _a;
                            console.log("checking argument: ".concat(actionArg.id));
                            console.log(currentAction.argsData[actionArg.id]);
                            if (actionArg.defaultValue != null &&
                                !currentAction.argsData[actionArg.id]) {
                                console.log("Setting default value for \"".concat((_a = actionArg.label) !== null && _a !== void 0 ? _a : actionArg.id, "\", set to: ").concat(actionArg.defaultValue));
                                currentAction.argsData[actionArg.id] = actionArg.defaultValue;
                            }
                        });
                        waitForURLToBe = currentRunningTestState.status.onlyRunNextActionAfterURLPathBecomes ||
                            currentAction.argsData[makeNativeAdvancedArgIdWithPrefix("waitForURLToBe")];
                        pathWithoutDomain = window.location.href.substring((window.location.protocol + "//" + window.location.host).length);
                        if (waitForURLToBe && pathWithoutDomain !== waitForURLToBe) {
                            console.log("Going to wait for URL to be ready for action", currentActionIndex);
                            setTimeout(function () {
                                // try again in a momment
                                processNextAction_1();
                            }, 1000);
                            return [2 /*return*/];
                        }
                        timeoutState = {
                            didTimeout: false,
                            didFinish: false,
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, wait_1(currentRunningTestState.delayBetweenActionsInMS)];
                    case 2:
                        _b.sent();
                        setTimeout(function () {
                            if (!timeoutState.didFinish) {
                                timeoutState.didTimeout = true;
                                failAtCurrentAction_1("Action timed out after ".concat(Math.round(currentAction.maxDurationInMS / 1000), " seconds."));
                            }
                        }, currentAction.maxDurationInMS);
                        modifiersResult = {
                            data: null,
                            generatedActions: [],
                        };
                        return [4 /*yield*/, actionRunner.run({
                                args: currentAction.argsData,
                                globals: currentRunningTestState.globals,
                            })];
                    case 3:
                        result = _b.sent();
                        currentRunningTestState.globals = __assign(__assign({}, currentRunningTestState.globals), (result && result.moreGlobalVars ? result.moreGlobalVars : {}));
                        actionGenerators = (0, flattenArray_1.flattenArray)(actionRunners_1.map(function (runner) { return runner.actionGenerators || []; }));
                        if (actionGenerators.length > 0 &&
                            !currentRunningTestState.disableGenerators) {
                            actionRunnerIdsToRunners_1 = actionRunners_1.reduce(function (acc, curr) {
                                acc[curr.id] = curr;
                                return acc;
                            }, {});
                            for (_i = 0, actionGenerators_1 = actionGenerators; _i < actionGenerators_1.length; _i++) {
                                generator = actionGenerators_1[_i];
                                generatedActions = generator(currentRunningTestState.globals);
                                (_a = modifiersResult.generatedActions).push.apply(_a, (generatedActions || []).map(function (generatedAction) {
                                    var _a;
                                    var actionId = generatedAction.actionId;
                                    var actionRunner = actionRunnerIdsToRunners_1[actionId];
                                    if (!actionRunner) {
                                        throw new Error("No action runner found for action with id ".concat(actionId, "."));
                                    }
                                    return {
                                        actionId: actionId,
                                        generalActionLabel: actionRunner.label,
                                        generatedActionLabel: generatedAction.generatedActionLabel,
                                        argsData: generatedAction.argsData,
                                        requiresOneOf: (_a = actionRunner.requiresOneOf) !== null && _a !== void 0 ? _a : null,
                                    };
                                }));
                            }
                        }
                        timeoutState.didFinish = true;
                        mostRecentTestState = globalState_1.currentRunningTestState;
                        if ((mostRecentTestState === null || mostRecentTestState === void 0 ? void 0 : mostRecentTestState.status.type) !== "running" ||
                            timeoutState.didTimeout) {
                            // If the person cancelled the run, we ignore the result
                            return [2 /*return*/];
                        }
                        if (!isLastAction) return [3 /*break*/, 5];
                        currentRunningTestState.status = {
                            type: "success",
                        };
                        dispatchActionSetMostRecentTestState_1({
                            state: currentRunningTestState,
                        });
                        return [4 /*yield*/, cleanup()];
                    case 4:
                        _b.sent();
                        dispatchTestSucceededEvent();
                        return [3 /*break*/, 8];
                    case 5:
                        currentRunningTestState.status.onlyRunNextActionAfterURLPathBecomes =
                            result &&
                                typeof result.onlyRunNextActionAfterURLPathBecomes === "string"
                                ? result.onlyRunNextActionAfterURLPathBecomes
                                : null;
                        currentActionIndex_1 = currentRunningTestState.status.currentActionIndex;
                        shouldStopAtCurrentIndex = currentRunningTestState.status.stopAtActionIndex != null
                            ? currentRunningTestState.status.stopAtActionIndex ===
                                currentActionIndex_1
                            : false;
                        if (!shouldStopAtCurrentIndex) return [3 /*break*/, 7];
                        currentRunningTestState.status = {
                            type: "stopped",
                            actionIndex: currentActionIndex_1,
                        };
                        dispatchActionSetMostRecentTestState_1({
                            state: currentRunningTestState,
                        });
                        return [4 /*yield*/, cleanup()];
                    case 6:
                        _b.sent();
                        dispatchTestActionStoppedMessage(currentActionIndex_1);
                        return [3 /*break*/, 8];
                    case 7:
                        nextActionIndex = currentActionIndex_1 + 1;
                        currentRunningTestState.status.currentActionIndex = nextActionIndex;
                        dispatchActionSetMostRecentTestState_1({
                            state: currentRunningTestState,
                        });
                        dispatchTestActionSuccessMessage(nextActionIndex);
                        processNextAction_1();
                        _b.label = 8;
                    case 8:
                        dispatchMessageToSetGlobalsOnLastRun({
                            actionIndex: currentActionIndex,
                            generatedActions: modifiersResult.generatedActions,
                            globalsOnLastRun: Object.keys(currentRunningTestState.globals).length > 0
                                ? currentRunningTestState.globals
                                : null,
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _b.sent();
                        timeoutState.didFinish = true;
                        // @ts-ignore
                        failAtCurrentAction_1(e_1.message);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    }
};
var initializeTestActions = function (args) {
    initTest(args.actions);
};
exports.initializeTestActions = initializeTestActions;
