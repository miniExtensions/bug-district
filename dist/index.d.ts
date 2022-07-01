import {
    ActionGeneratorIterator, ActionRunner, GeneratedActionInternalAction, TestRunGlobals
} from './types';

export type {
  ActionRunner,
  ActionGeneratorIterator,
  TestRunGlobals,
  GeneratedActionInternalAction,
};
export declare const initializeTestActions: (args: {
  actions: ActionRunner[];
}) => void;
