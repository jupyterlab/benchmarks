import waitForLocalhost from "wait-for-localhost";

before(async () => {
  console.log("Waiting for localhost:9999");
  await waitForLocalhost({ path: '/lab', port: 9999, useGet: true });
  console.log("localhost:9999 is up");
});
