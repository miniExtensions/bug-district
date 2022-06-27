import { flattenArray } from './flattenArray';
import {
    ActionGeneratorIterator, ActionRunner, ActionRunnerArgument, GenerateActionsFunc,
    GeneratedAction, GeneratedActionInternalAction, TestRunGlobals
} from './types';

export type {
  ActionRunner,
  ActionGeneratorIterator,
  TestRunGlobals,
  GeneratedActionInternalAction,
};
// KEEP THIS IN SYNC
type PageRunnerAction = {
  id: string;
  argsData: { [key: string]: string };
  maxDurationInMS: number;
};
type CurrentRunningTestState = {
  status:
    | { type: "not-started" }
    | {
        type: "running";
        currentActionIndex: number;
        testWasStartedAt: number;
        stopAtActionIndex: number | null | undefined;
        onlyRunNextActionAfterURLPathBecomes: string | null;
      }
    | { type: "success" }
    | {
        type: "failure";
        failedActionIndex: number;
        errorMessage: string;
      }
    | {
        type: "stopped";
        actionIndex: number;
      };
  actions: PageRunnerAction[];
  delayBetweenActionsInMS: number;
  globals: { [key: string]: string };
  disableGenerators: boolean;
};

type GlobalState = {
  currentRunningTestState: CurrentRunningTestState | null;
  parentWindowRecievedAvailableAction: boolean;
};
const deleteAllCookies = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

const cleanup = async () => {
  localStorage.clear();
  deleteAllCookies();
  sessionStorage.clear();
  const dbs = await window.indexedDB.databases();
  for (const db of dbs) {
    // @ts-ignore
    window.indexedDB.deleteDatabase(db.name);
  }
};

// KEEP THIS IN SYNC WITH LIBRARY
const NATIVE_ACTION_ID_PREFIX = "NATIVE_ACTION_ID_";

// KEEP THIS IN SYNC WITH WEBSITE
const makeNativeActionIdWithPrefix = (id: string) =>
  `${NATIVE_ACTION_ID_PREFIX}${id}`;

// KEEP THIS IN SYNC WITH WEBSITE
const NATIVE_ADVANCED_ARG_ID_PREFIX = "NATIVE_ADVANCED_ARG_ID_";

// KEEP THIS IN SYNC WITH WEBSITE
const makeNativeAdvancedArgIdWithPrefix = (id: string) =>
  `${NATIVE_ADVANCED_ARG_ID_PREFIX}${id}`;

const dispatchActionFailedEvent = (args: {
  actionIndex: number;
  errorMessage: string;
}) => {
  const message = {
    source: "ui-tester",
    type: "test-failed",
    actionIndex: args.actionIndex,
    errorMessage: args.errorMessage,
  };

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};

const dispatchTestSucceededEvent = async () => {
  const message = {
    source: "ui-tester",
    type: "test-succeeded",
  };

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};

const dispatchTestActionSuccessMessage = async (nextActionIndex: number) => {
  const message = {
    source: "ui-tester",
    type: "test-action-succeeded",
    nextActionIndex,
  };

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};

const dispatchTestActionStoppedMessage = async (actionIndex: number) => {
  const message = {
    source: "ui-tester",
    type: "test-action-stopped",
    actionIndex,
  };

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};

const dispatchMessageToSetGlobalsOnLastRun = async (args: {
  globalsOnLastRun: TestRunGlobals | null;
  actionIndex: number;
  generatedActions: GeneratedAction[];
}) => {
  const message = {
    source: "ui-tester",
    type: "set-globals-on-last-run",
    globalsOnLastRun: args.globalsOnLastRun,
    actionIndex: args.actionIndex,
    generatedActions: args.generatedActions,
  };

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};

/**
 * These are the actions that the iframe sends to us to inform us that they are available.
 * KEEP IN SYNC WITH WEBSITE
 */
type AvailableTestAction = {
  id: string;
  label: string;
  enableNativeAdvancedOptions?: boolean;
  arguments: ActionRunnerArgument[];
  /**
   * If an action id is provided, we will only show this action if the user
   * has that action already on their test.
   */
  requiresOneOf: string[] | null;
  maxDurationInSeconds: number | null;
};

const dispatchActionForAvailableActions = (
  actionRunners: ActionRunner[],
  globalState: GlobalState
) => {
  const message = {
    source: "ui-tester",
    type: "available-actions",
    actions: actionRunners.map((runner): AvailableTestAction => {
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

  const parentWindow = window.parent;

  if (parentWindow) {
    parentWindow.postMessage(message, "*");

    setTimeout(() => {
      if (!globalState.parentWindowRecievedAvailableAction) {
        // Retry
        dispatchActionForAvailableActions(actionRunners, globalState);
      }
    }, 500);
  } else {
    throw new Error("Could not find a parent window to post message to.");
  }
};
const initTest = (actionRunnersFromUser: ActionRunner[]) => {
  if (
    typeof window !== "undefined" &&
    process.env.JEST_WORKER_ID == null &&
    process.env.NODE_ENV === "development"
  ) {
    const jestExpect = require("expect");
    // We override the global expect here.
    // @ts-ignore
    window.expect = jestExpect;
    // @ts-ignore
    global.expect = jestExpect;

    require("@testing-library/jest-dom");

    const eventMethod = Boolean(window.addEventListener)
      ? "addEventListener"
      : "attachEvent";

    // @ts-ignore
    const eventer = window[eventMethod];
    const messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    const globalState: GlobalState = {
      currentRunningTestState: null,
      parentWindowRecievedAvailableAction: false,
    };

    const failAtCurrentAction = (errorMessage: string) => {
      const { currentRunningTestState } = globalState;
      if (
        !currentRunningTestState ||
        currentRunningTestState.status.type !== "running"
      ) {
        throw new Error(
          "failAtCurrentAction called when not in running state."
        );
      }

      const currentActionIndex =
        currentRunningTestState.status.currentActionIndex;

      const newStatus: CurrentRunningTestState["status"] = {
        type: "failure",
        failedActionIndex: currentActionIndex,
        errorMessage,
      };

      dispatchActionSetMostRecentTestState({
        state: { ...currentRunningTestState, status: newStatus },
      });

      dispatchActionFailedEvent({
        errorMessage,
        actionIndex: currentActionIndex,
      });
    };
    const dispatchActionSetMostRecentTestState = async (args: {
      state: CurrentRunningTestState | null;
    }) => {
      globalState.currentRunningTestState = args.state;
      const message = {
        source: "ui-tester",
        type: "set-most-recent-state",
        state: args.state,
      };

      const parentWindow = window.parent;

      if (parentWindow) {
        parentWindow.postMessage(message, "*");
      } else {
        throw new Error("Could not find a parent window to post message to.");
      }
    };
    eventer(
      messageEvent,
      async (e: any) => {
        if (!e.data) return;

        if (e && e.data && e.data.source === "ui-tester") {
          console.log("TEST DATA::", e.data);
          if (e.data.type === "start-test" && e.data.actions) {
            const actions = e.data.actions as PageRunnerAction[];
            const disableGenerators = e.data.disableGenerators as boolean;
            const stopAtActionIndex = e.data.stopAtActionIndex as number | null;

            const delayBetweenActionsInMS = e.data
              .delayBetweenActionsInMS as number;

            await cleanup();

            const state: CurrentRunningTestState = {
              status: {
                type: "running",
                currentActionIndex: 0,
                onlyRunNextActionAfterURLPathBecomes: null,
                stopAtActionIndex,
                testWasStartedAt: Date.now(),
              },
              actions,
              delayBetweenActionsInMS,
              globals: {},
              disableGenerators,
            };

            dispatchActionSetMostRecentTestState({ state });

            processNextAction();
          } else if (e.data.type === "did-recieve-available-actions") {
            const currentRunningTestState = e.data
              .mostRecentState as CurrentRunningTestState | null;

            globalState.parentWindowRecievedAvailableAction = true;
            dispatchActionSetMostRecentTestState({
              state: currentRunningTestState,
            });
            if (
              globalState.currentRunningTestState &&
              globalState.currentRunningTestState.status.type === "running"
            ) {
              processNextAction();
            }
          }
        }
      },
      false
    );

    const goToURLPathNativeAction: ActionRunner = {
      id: makeNativeActionIdWithPrefix("goToURLPath"),
      label: "Go to URL Path",
      arguments: [
        {
          id: "path",
          label: "URL Path",
          subtitle: "e.g. /settings",
        },
      ],
      run: async (data) => {
        const { path } = data.args;
        window.location.href = path;

        return {
          onlyRunNextActionAfterURLPathBecomes: path,
        };
      },
    };

    const actionRunners: ActionRunner[] = [
      goToURLPathNativeAction,
      ...actionRunnersFromUser,
    ];

    dispatchActionForAvailableActions(actionRunners, globalState);

    const wait = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const processNextAction = async () => {
      const { currentRunningTestState } = globalState;
      if (
        !currentRunningTestState ||
        currentRunningTestState.status.type !== "running"
      ) {
        throw new Error("processNextAction called when not in running state.");
      }

      const currentActionIndex =
        currentRunningTestState.status.currentActionIndex;
      console.log("Running action at index", currentActionIndex);
      const currentAction = currentRunningTestState.actions[currentActionIndex];

      const isLastAction =
        currentActionIndex === currentRunningTestState.actions.length - 1;

      const actionRunner = actionRunners.find(
        (actionRunner) => currentAction.id === actionRunner.id
      );

      if (!actionRunner) {
        failAtCurrentAction(
          `No action runner found for action with id ${currentAction.id}.`
        );
        return;
      }
      // Set default values
      actionRunner.arguments.map((actionArg) => {
        console.log(`checking argument: ${actionArg.id}`);

        console.log(currentAction.argsData[actionArg.id]);

        if (
          actionArg.defaultValue != null &&
          !currentAction.argsData[actionArg.id]
        ) {
          console.log(
            `Setting default value for "${
              actionArg.label ?? actionArg.id
            }", set to: ${actionArg.defaultValue}`
          );

          currentAction.argsData[actionArg.id] = actionArg.defaultValue;
        }
      });
      const waitForURLToBe: string | undefined =
        currentRunningTestState.status.onlyRunNextActionAfterURLPathBecomes ||
        currentAction.argsData[
          makeNativeAdvancedArgIdWithPrefix("waitForURLToBe")
        ];

      const pathWithoutDomain = window.location.href.substring(
        (window.location.protocol + "//" + window.location.host).length
      );

      if (waitForURLToBe && pathWithoutDomain !== waitForURLToBe) {
        console.log(
          "Going to wait for URL to be ready for action",
          currentActionIndex
        );
        setTimeout(() => {
          // try again in a momment
          processNextAction();
        }, 1000);
        return;
      }

      const timeoutState: {
        didTimeout: boolean;
        didFinish: boolean;
      } = {
        didTimeout: false,
        didFinish: false,
      };

      try {
        await wait(currentRunningTestState.delayBetweenActionsInMS);

        setTimeout(() => {
          if (!timeoutState.didFinish) {
            timeoutState.didTimeout = true;

            failAtCurrentAction(
              `Action timed out after ${Math.round(
                currentAction.maxDurationInMS / 1000
              )} seconds.`
            );
          }
        }, currentAction.maxDurationInMS);

        const modifiersResult: {
          data: any | null;
          generatedActions: GeneratedAction[];
        } = {
          data: null,
          generatedActions: [],
        };

        const result = await actionRunner.run({
          args: currentAction.argsData,
          globals: currentRunningTestState.globals,
        });

        currentRunningTestState.globals = {
          ...currentRunningTestState.globals,
          ...(result && result.moreGlobalVars ? result.moreGlobalVars : {}),
        };

        const actionGenerators: GenerateActionsFunc[] = flattenArray(
          actionRunners.map((runner) => runner.actionGenerators || [])
        );

        if (
          actionGenerators.length > 0 &&
          !currentRunningTestState.disableGenerators
        ) {
          const actionRunnerIdsToRunners = actionRunners.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {} as { [id: string]: ActionRunner });

          for (const generator of actionGenerators) {
            const generatedActions = generator(currentRunningTestState.globals);

            modifiersResult.generatedActions.push(
              ...(generatedActions || []).map(
                (generatedAction): GeneratedAction => {
                  const actionId = generatedAction.actionId;
                  const actionRunner = actionRunnerIdsToRunners[actionId];

                  if (!actionRunner) {
                    throw new Error(
                      `No action runner found for action with id ${actionId}.`
                    );
                  }
                  return {
                    actionId,
                    generalActionLabel: actionRunner.label,
                    generatedActionLabel: generatedAction.generatedActionLabel,
                    argsData: generatedAction.argsData,
                    requiresOneOf: actionRunner.requiresOneOf ?? null,
                  };
                }
              )
            );
          }
        }

        timeoutState.didFinish = true;

        const { currentRunningTestState: mostRecentTestState } = globalState;

        if (
          mostRecentTestState?.status.type !== "running" ||
          timeoutState.didTimeout
        ) {
          // If the person cancelled the run, we ignore the result
          return;
        }

        if (isLastAction) {
          currentRunningTestState.status = {
            type: "success",
          };

          dispatchActionSetMostRecentTestState({
            state: currentRunningTestState,
          });
          await cleanup();
          dispatchTestSucceededEvent();
        } else {
          currentRunningTestState.status.onlyRunNextActionAfterURLPathBecomes =
            result &&
            typeof result.onlyRunNextActionAfterURLPathBecomes === "string"
              ? result.onlyRunNextActionAfterURLPathBecomes
              : null;

          const currentActionIndex =
            currentRunningTestState.status.currentActionIndex;

          const shouldStopAtCurrentIndex =
            currentRunningTestState.status.stopAtActionIndex != null
              ? currentRunningTestState.status.stopAtActionIndex ===
                currentActionIndex
              : false;

          if (shouldStopAtCurrentIndex) {
            currentRunningTestState.status = {
              type: "stopped",
              actionIndex: currentActionIndex,
            };

            dispatchActionSetMostRecentTestState({
              state: currentRunningTestState,
            });

            await cleanup();

            dispatchTestActionStoppedMessage(currentActionIndex);
          } else {
            const nextActionIndex = currentActionIndex + 1;
            currentRunningTestState.status.currentActionIndex = nextActionIndex;

            dispatchActionSetMostRecentTestState({
              state: currentRunningTestState,
            });

            dispatchTestActionSuccessMessage(nextActionIndex);

            processNextAction();
          }
        }

        dispatchMessageToSetGlobalsOnLastRun({
          actionIndex: currentActionIndex,
          generatedActions: modifiersResult.generatedActions,
          globalsOnLastRun:
            Object.keys(currentRunningTestState.globals).length > 0
              ? currentRunningTestState.globals
              : null,
        });
      } catch (e) {
        timeoutState.didFinish = true;
        // @ts-ignore
        failAtCurrentAction(e.message);
      }
    };
  }
};

export const initializeTestActions = (args: { actions: ActionRunner[] }) => {
  initTest(args.actions);
};
