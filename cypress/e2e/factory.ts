import { faker } from "@faker-js/faker";

// oauth credential for google login/register
export function factoryRandomOauthGoogle() {
  return {
    provider: "google",
    userId: faker.random.numeric(20),
  };
}

// account credentials
export function factoryRandomAccount() {
  return {
    invalidUsername: faker.random.alpha(20),
    validUsername: faker.random.alpha(10),
    invalidWalletAddress: faker.random.alpha(20),
    validWalletAddress1: "0x0E19085DB3FbD6bfc7764dC8CEF89edE76111f1f",
    validWalletAddress2: "0xe32C26Be24232ba92cd89d116985F81f94Dd26a8",
    generalEmail: faker.internet.email(),
    adminEmail: faker.internet.email("", "", "hiro.cash"),
  };
}
