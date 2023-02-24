import { factoryRandomOauthGoogle, factoryRandomAccount } from "./factory";

describe("smoke tests", () => {
  // prepare oauth, account and wallet credentials
  const oauth = factoryRandomOauthGoogle();
  const account = factoryRandomAccount();
  afterEach(() => {
    cy.cleanupOauth();
    cy.cleanupAccount(account.validUsername); // cleanup the account
  });

  it("should allow you to create a new account with valid credentials", () => {
    // login/register with a session
    cy.visitAndCheck("/");
    cy.login(oauth.provider, oauth.userId, account.generalEmail);

    // check username validation
    cy.visitAndCheck("/home/new");
    cy.findByTestId("username").type(account.invalidUsername);
    cy.findByTestId("create-account").click().wait(1000);
    cy.findByText("username has to be 4 - 15 characters long");

    // create an account with valid username
    cy.findByTestId("username").type(
      `{selectall}{backspace}${account.validUsername}`
    );
    cy.findByTestId("create-account").click().wait(15000);

    // check wallet address validation
    cy.visitAndCheck(`/home/${account.validUsername}/wallet/new`);
    cy.findByTestId("wallet-address").type(account.invalidWalletAddress);
    cy.get('input[type="checkbox"]').check();
    cy.findByTestId("create-wallet").click().wait(2000);
    cy.findByText("must be a valid ethereum address.");

    // create a wallet account with valid wallet address
    cy.findByTestId("wallet-address").type(
      `{selectall}{backspace}${account.validWalletAddress1}`
    );
    cy.get('input[type="checkbox"]').check();
    cy.findByTestId("create-wallet").click().wait(15000);

    // visit user profile page and validate wallet address
    cy.visitAndCheck(`/home/${account.validUsername}`);
    cy.findByTestId("account-link").click().wait(2000);
    cy.url().should("include", `/${account.validUsername}`);
    cy.visitAndCheck(`/${account.validUsername}`);
    cy.findByTestId("account-wallet-address")
      .should("contain", `${account.validWalletAddress1}`)
      .wait(2000);

    // clean up and create new oauth for testing unique username constraint
    cy.visitAndCheck("/");
    cy.cleanupOauth();
    cy.login(oauth.provider, oauth.userId, account.generalEmail);

    // validate unique username constraint
    cy.visitAndCheck("/home/new");
    cy.findByTestId("username").type(`${account.validUsername}`);
    cy.findByTestId("create-account").click().wait(5000);
    cy.findByText("username already taken").wait(1000);
  });
});
