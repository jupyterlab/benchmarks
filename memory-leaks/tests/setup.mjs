import parse from "parse-url";
import waitForLocalhost from "wait-for-localhost";
import { URL } from "./utils.mjs";

before(async () => {
  const url = parse(URL);
  console.log(`Waiting for ${url.resource}`);
  await waitForLocalhost({ path: url.pathname, port: url.port, useGet: true });
  console.log(`${url.resource} is up`);
});
