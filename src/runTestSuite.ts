/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-async-promise-executor */
/* eslint-disable prefer-arrow-functions/prefer-arrow-functions */

import * as puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";

const pathArg = process.argv[2] ?? null;
const localhostPort = process.argv[3] ?? null;

if (!pathArg) {
  throw new Error("Please provide a path to the test suite");
}

if (!localhostPort) {
  throw new Error("Please provide a localhost port");
}

const filePath = path.resolve(pathArg);

export const wait = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

new Promise(async (resolve, reject) => {
  // @ts-ignore
  fs.readFile(filePath, "utf8", async (err: Error, data: any) => {
    if (err) {
      console.error(err);
      reject(err);
      return;
    }

    const jsonContent = data;

    const browser = await puppeteer.launch({
      dumpio: false,
      headless: true,
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(`https://bug-district.vercel.app/run-all-on-ci`);
    // await page.goto(`http://localhost:3001/run-all-on-ci`);

    const onSuccess = () => {
      console.log("All tests passed.");
      process.exit(0);
    };

    await page.exposeFunction("onSuccess", onSuccess);

    const onFailure = (errorMessage: string) => {
      console.error(errorMessage);
      process.exit(1);
    };

    await page.exposeFunction("onFailure", onFailure);

    await page.evaluate(
      ({ jsonContent, localhostPort }) => {
        const message = {
          source: "ui-tester",
          type: "run-test-suite-on-ci",
          domainUrl: `http://localhost:${localhostPort}`,
          jsonContent,
        };

        window.postMessage(message, "*");

        window.addEventListener("message", (event) => {
          if (event.data.source != "ui-tester") {
            return;
          }

          if (event.data.type === "test-suite-success-on-ci") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const message = event.data;
            // @ts-ignore
            onSuccess();
          } else if (event.data.type === "test-suite-failure-on-ci") {
            const message = event.data;
            // @ts-ignore
            onFailure(message.error);
          }
        });
      },
      { jsonContent, localhostPort }
    );
  });
});
