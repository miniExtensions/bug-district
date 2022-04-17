## Install the library

`yarn add --dev bug-district`


## Initialize your first actions

1. Instal [@testing-library/dom](https://testing-library.com/docs/dom-testing-library/install).
2. Create a file named "bug-district.ts" in your code and add the following contents to it:
```
import { initializeTestActions, ActionRunner } from 'bug-district';
import { screen, waitFor } from '@testing-library/dom';

const actionRunners: ActionRunner[] = [
  {
    // An example of an action that checks if a text is on the screen
    id: 'check-text-is-visible-on-screen',
    label: 'Check that text is visible on screen',
    arguments: [{ id: 'text' }],
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
            { timeout: 20000 }
        ).catch((e) => {
            throw e;
        });
   },
];

initializeTestActions({ actions: actionRunners });
```
3. Import `bug-district.ts` somewhere in your app:

`import './bug-district'`

4. Login with your Github account on [Bug District](https://bug-district.vercel.app/)
5. Go to the Github repo that you want to add tests
6. Select a branch (e.g. master)
7. Add a test case
8. Add actions and run your test case!


### NOTE: You must use Chrome to run the tests on [Bug District](https://bug-district.vercel.app/). You will also need to enable "Insecure origins treated as secure". Navigate to chrome://flags/ to enable the option.
