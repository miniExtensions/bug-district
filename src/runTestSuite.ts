import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

import { chunkArray } from './chunkArray';

const transformObjPropertiesToPrintable = (
  properties?: puppeteer.Protocol.Runtime.PropertyPreview[]
): string => {
  if (properties == null) return "null value";
  if (properties.length == 0) return "";

  return JSON.stringify(
    properties.reduce<{ [propertyName: string]: string }>((prev, curr) => {
      prev[curr.name] =
        curr.type === "object"
          ? transformObjPropertiesToPrintable(curr.valuePreview?.properties)
          : curr.value ?? "undefined value";
      return prev;
    }, {})
  );
};

const defaultBugDistrictDomain = "https://bug-district.vercel.app";

const pathArg = process.argv[2] ?? null;
const localhostPort = process.argv[3] ?? null;
const domainForBugDistrict = process.argv[4] ?? defaultBugDistrictDomain;

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
      console.error(`Error while reading file: ${filePath}\n\n` + err);
      reject(err);
      return;
    }

    const testSuite = JSON.parse(data);

    const browser = await puppeteer.launch({
      dumpio: true,
      // dumpio: domainForBugDistrict !== defaultBugDistrictDomain ,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(`${domainForBugDistrict}/run-all-on-ci`);
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

    // Log the page's logs to make debugging easier
    page.on("console", (s) => {
      const data = s.args()[0]?._remoteObject;
      if (data == null) return;
      const finalLog =
        data.type === "object"
          ? transformObjPropertiesToPrintable(data.preview?.properties)
          : s.text();
      console.log(finalLog);
    });

    await page.evaluate(
      ({ testSuite, localhostPort }) => {
        const message = {
          source: "ui-tester",
          type: "run-test-suite-on-ci",
          domainUrl: `http://localhost:${localhostPort}`,
          jsonContent: JSON.stringify(testSuite),
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
      { testSuite, localhostPort }
    );
  });
});
