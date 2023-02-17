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
       *    cy.login('siwe','0x0E19085DB3FbD6bfc7764dC8CEF89edE76111f1f')
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
       *    cy.cleanupUser('provider','userId')
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Deletes the current @account
       *
       * @returns {typeof cleanupAccount}
       * @memberof Chainable
       * @example
       *    cy.cleanupAccount()
       * @example
       *    cy.cleanupAccount('username')
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

function login(provider: string, userId: string) {
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

function cleanupUser(provider: string, userId: string) {
  if (userId && provider) {
    deleteUserByProviderUserId(provider, userId);
  }
  cy.clearCookie("__session");
}

function deleteUserByProviderUserId(provider: string, userId: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${provider}" "${userId}"`
  );
}

function cleanupAccount(username: string) {
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
