## Install the library

`yarn add --dev bug-district`


## Initialize your first action

1. Install [@testing-library/dom](https://testing-library.com/docs/dom-testing-library/install).
2. Create a file named "bug-district.ts" in your code and add the following contents to it:
```
import { initializeTestActions, ActionRunner } from 'bug-district';
import { screen, waitFor } from '@testing-library/dom';

const actionRunners: ActionRunner[] = [
  {
    // An example of an action that checks if a text is on the screen.
    id: 'check-text-is-visible-on-screen',
    
    // A label to be shown in the test runner.
    label: 'Check that text is visible on screen',
    
    // Arguments that can be set in the test runner.
    arguments: [{ id: 'text' }],
    
    // The function that will run when the action is triggered.
    run: async (data) => {
        const { text } = data.args;
        await waitFor(
            async () => {
                const element = await screen.findByText(text);

                if (element == null) {
                    throw new Error(
                        'Could not find text "' + text + '" on the screen.'
                    );
                }
            },
        )
   },
];

// Initialize the actions that will run in your tests
initializeTestActions({ actions: actionRunners });
```
3. Import `bug-district.ts` somewhere in your app:

`import './bug-district'`

4. Run your localhost web server (e.g. `yarn dev` or `yarn start`).
5. Login with your Github account on [Bug District](https://bug-district.vercel.app/)
6. Go to the Github repo that you want to add tests to on Bug District, then select a branch  (e.g. master)
7. Add a test case on Bug District
8. Add actions and run your test case!


### NOTE: You must use Chrome to run the tests on [Bug District](https://bug-district.vercel.app/). You will also need to enable "Insecure origins treated as secure". Navigate to chrome://flags/ to enable the option.



## Run all tests

To run all of your tests, add the following script to your "package.json" file.

```
"run-ui-tests": "node ./node_modules/bug-district/dist/runTestSuite.js ./ui-tester-test-suite.json PORT"
```

Replace `PORT` with your localhost post where your website runs (e.g. `3000`). If the parth the the node_modules or the test-suite needs to be changed, then make sure to change it in the script.

You can then run the script like this:
```
yarn run-ui-tests
```
