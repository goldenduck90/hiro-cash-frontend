// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random oauth. Yields the oauth and adds an alias to the oauth
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login('google','120983490862134098', 'test@gmail.com')
       */
      login: typeof login;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupOauth}
       * @memberof Chainable
       * @example
       *    cy.cleanupOauth()
       * @example
       *    cy.cleanupOauth('provider','userId')
       */
      cleanupOauth: typeof cleanupOauth;

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
      visitAndNoPermissionAdmin: typeof visitAndNoPermissionAdmin;
    }
  }
}

function login(provider: string, userId: string, email: string) {
  cy.then(() => ({ provider, userId, email })).as("oauth");
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-oauth.ts "${provider}" "${userId}" "${email}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);
  });
  return cy.get("@oauth");
}

function cleanupOauth(provider?: string, userId?: string) {
  if (userId && provider) {
    deleteOauthByProviderUserId(provider, userId);
  } else {
    cy.get("@oauth").then((oauth) => {
      const { provider, userId } = oauth as {
        provider?: string;
        userId?: string;
      };
      if (provider && userId) {
        deleteOauthByProviderUserId(provider, userId);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteOauthByProviderUserId(provider: string, userId: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-oauth.ts "${provider}" "${userId}"`
  );
}

function cleanupAccount(username: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-account.ts "${username}"`
  );
  cy.clearCookie("__session");
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

function visitAndNoPermissionAdmin(url: string, waitTime: number = 1000) {
  cy.visit(url);
  cy.location("pathname").should("not.contain", url).wait(waitTime);
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupOauth", cleanupOauth);
Cypress.Commands.add("cleanupAccount", cleanupAccount);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
Cypress.Commands.add("visitAndNoPermissionAdmin", visitAndNoPermissionAdmin);
