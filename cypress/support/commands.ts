// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupAccount}
       * @memberof Chainable
       * @example
       *    cy.cleanupAccount()
       * @example
       *    cy.cleanupAccount({ username: 'silverstar' })
       */
      cleanupAccount: typeof cleanupAccount;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  provider = "siwe",
  userId = "0xe32C26Be24232ba92cd89d116985F81f94Dd26a8",
}: {
  provider?: string;
  userId?: string;
} = {}) {
  cy.then(() => ({ provider, userId })).as("user");
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${provider}" "${userId}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);
  });
  return cy.get("@user");
}

function cleanupUser({
  provider,
  userId,
}: { provider?: string; userId?: string } = {}) {
  if (userId && provider) {
    deleteUserByProviderUserId(provider, userId);
  } else {
    cy.get("@user").then((user) => {
      const { provider, userId } = user as {
        provider?: string;
        userId?: string;
      };
      if (provider && userId) {
        deleteUserByProviderUserId(provider, userId);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByProviderUserId(provider?: string, userId?: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${provider}" "${userId}"`
  );
}

function cleanupAccount({ username }: { username?: string } = {}) {
  if (username) {
    deleteAccountByUsername(username);
  }
  cy.clearCookie("__session");
}

function deleteAccountByUsername(username: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-account.ts "${username}"`
  );
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupUser", cleanupUser);
Cypress.Commands.add("cleanupAccount", cleanupAccount);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
