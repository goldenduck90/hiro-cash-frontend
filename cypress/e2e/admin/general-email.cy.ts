import { factoryRandomOauthGoogle, factoryRandomAccount } from "../factory";

describe("Admin dashboard page", () => {
  // prepare oauth and account credentials
  const oauth = factoryRandomOauthGoogle();
  const account = factoryRandomAccount();

  afterEach(() => {
    cy.cleanupOauth();
    cy.cleanupAccount(account.validUsername);
  });

  it("Should not allow you visit admin page @hiro.cash domain email", () => {
    // login/register with a session
    cy.visitAndCheck("/");
    cy.login(oauth.provider, oauth.userId, account.generalEmail);
    cy.visitAndCheck("/home/new");

    cy.findByTestId("username").type(account.validUsername);
    cy.findByTestId("create-account").click().wait(15000);
    cy.visitAndNoPermissionAdmin("/admin");

    // UI test
    cy.findByTestId("admin-account-title").should("not.exist");
  });
});
