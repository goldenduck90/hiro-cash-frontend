import { factoryRandomOauthGoogle, factoryRandomAccount } from "../factory";
import truncateEthAddress from "truncate-eth-address";

describe("Admin dashboard page", () => {
  // prepare oauth and account credentials
  const oauth = factoryRandomOauthGoogle();
  const account = factoryRandomAccount();
  beforeEach(() => {
    // login/register with a session
    cy.visitAndCheck("/");
    cy.login(oauth.provider, oauth.userId, account.adminEmail);

    // create an account with valid username
    cy.visitAndCheck("/home/new");
    cy.findByTestId("username").type(account.validUsername);
    cy.findByTestId("create-account").click().wait(15000);
  });

  afterEach(() => {
    cy.cleanupOauth();
    cy.cleanupAccount(account.validUsername);
  });

  it("Admin Login Test", () => {
    cy.visitAndCheck("/admin/accounts", 10000);

    // UI test
    cy.findByTestId("admin-account-title").should("exist");
    cy.findByTestId("account-table-header-ID").should("exist");
    cy.findByTestId("account-table-header-Address").should("exist");
    cy.findByTestId("account-table-header-Token").should("exist");
  });

  it("Admin without wallet Test", () => {
    cy.visitAndCheck("/admin/accounts", 10000);

    // UI test
    cy.findByTestId(account.validUsername + "-id").should("exist");
    cy.findByTestId(account.validUsername + "-wallet")
      .should("exist")
      .and("be.empty");
    cy.findByTestId(account.validUsername + "-tokens")
      .should("exist")
      .and("be.empty");
  });

  it("Admin include 1 wallet Test", () => {
    // create a wallet account with valid wallet address
    cy.visitAndCheck(`/home/${account.validUsername}/wallet/new`);
    cy.findByTestId("wallet-address").type(account.validWalletAddress1);
    cy.get('input[type="checkbox"]').check();
    cy.findByTestId("create-wallet").click().wait(15000);
    cy.visitAndCheck("/admin/accounts", 10000);

    // UI test
    cy.findByTestId("admin-account-title").should("exist");
    cy.findByTestId("account-table-header-ID").should("exist");
    cy.findByTestId("account-table-header-Address").should("exist");
    cy.findByTestId("account-table-header-Token").should("exist");
    cy.findByTestId(account.validUsername + "-id").should("exist");
    cy.findByTestId(account.validUsername + "-wallet-0")
      .should("exist")
      .and("contain", truncateEthAddress(account.validWalletAddress1));
  });

  it("Admin include 2 wallet Test", () => {
    // create a wallet account with valid wallet address
    cy.visitAndCheck(`/home/${account.validUsername}/wallet/new`);
    cy.findByTestId("wallet-address").type(account.validWalletAddress1);
    cy.get('input[type="checkbox"]').check();
    cy.findByTestId("create-wallet").click().wait(15000);

    // create a wallet account with another valid wallet address
    cy.visitAndCheck(`/home/${account.validUsername}/wallet/new`);
    cy.findByTestId("wallet-address").type(account.validWalletAddress2);
    cy.get('input[type="checkbox"]').check();
    cy.findByTestId("create-wallet").click().wait(15000);
    cy.visitAndCheck("/admin/accounts", 10000);

    // UI test
    cy.findByTestId("admin-account-title").should("exist");
    cy.findByTestId("account-table-header-ID").should("exist");
    cy.findByTestId("account-table-header-Address").should("exist");
    cy.findByTestId("account-table-header-Token").should("exist");
    cy.findByTestId(account.validUsername + "-id").should("exist");
    cy.findByTestId(account.validUsername + "-wallet-" + 0)
      .should("exist")
      .and("contain", truncateEthAddress(account.validWalletAddress1));
    cy.findByTestId(account.validUsername + "-wallet-" + 1)
      .should("exist")
      .and("contain", truncateEthAddress(account.validWalletAddress2));
  });
});
