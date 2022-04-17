export declare type ActionRunnerArgument = {
    id: string;
    label?: string;
    subtitle?: string;
    defaultValue?: string;
    advanced?: boolean;
};
export declare type GeneratedActionInternalAction = {
    actionId: string;
    generatedActionLabel: string;
    argsData: {
        [key: string]: string;
    };
};
export declare type GeneratedAction = {
    actionId: string;
    generalActionLabel: string;
    generatedActionLabel: string;
    argsData: {
        [key: string]: string;
    };
    requiresOneOf: string[] | null;
};
export declare type GenerateActionsFunc = (globals: TestRunGlobals) => GeneratedActionInternalAction[] | null | undefined;
export declare type TestRunGlobals = {
    [key: string]: any;
};
export declare type ActionRunner = {
    id: string;
    label: string;
    maxDurationInSeconds?: number;
    /**
     * If an action id is provided, we will only show this action if the user
     * has that action already on their test.
     */
    requiresOneOf?: string[];
    enableNativeAdvancedOptions?: boolean;
    arguments: ActionRunnerArgument[];
    actionGenerators?: GenerateActionsFunc[];
    run: (data: {
        args: {
            [key: string]: string;
        };
        globals: TestRunGlobals;
    }) => Promise<{
        onlyRunNextActionAfterURLPathBecomes?: string;
        moreGlobalVars?: TestRunGlobals;
    } | void>;
};
export declare type ActionGeneratorIterator<T> = (run: (args: T) => void, globals: TestRunGlobals) => void;
