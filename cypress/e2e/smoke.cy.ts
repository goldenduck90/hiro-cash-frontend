import { faker } from "@faker-js/faker";

// oauth credential for google login/register
function factoryRandomOauthGoogle() {
  return {
    provider: "google",
    userId: faker.random.numeric(20),
    profile: {
      emails: [{ value: faker.internet.email() }],
      name: faker.name.fullName(),
    },
  };
}

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupOauth();
  });

  it("should allow you to create a new account with valid credentials", () => {
    cy.fixture("credentials").then((credentials) => {
      // prepare oauth, account and wallet credentials
      const oauth = factoryRandomOauthGoogle();
      const invalidUsername = faker.random.alpha(20);
      const validUsername = faker.random.alpha(10);
      const invalidWalletAddress = faker.random.alpha(20);
      const validWalletAddress = credentials.walletAddress;

      // login/register with a session
      cy.visitAndCheck("/");
      cy.login(oauth.provider, oauth.userId);
      cy.visitAndCheck("/home/new");

      // check username validation
      cy.findByTestId("username").type(invalidUsername);
      cy.findByTestId("create-account").click().wait(1000);
      cy.findByText("username has to be 4 - 15 characters long");

      // create an account with valid username
      cy.findByTestId("username").type(
        `{selectall}{backspace}${validUsername}`
      );
      cy.findByTestId("create-account").click().wait(15000);
      cy.visitAndCheck(`/home/${validUsername}/wallet/new`);

      // check wallet address validation
      cy.visitAndCheck(`/home/${validUsername}/wallet/new`);
      cy.findByTestId("wallet-address").type(invalidWalletAddress);
      cy.findByRole("checkbox", { name: /usdt/i }).check();
      cy.findByTestId("create-wallet").click().wait(2000);
      cy.findByText("must be a valid ethereum address.");

      // create a wallet account with valid wallet address
      cy.findByTestId("wallet-address").type(
        `{selectall}{backspace}${validWalletAddress}`
      );
      cy.findByRole("checkbox", { name: /usdt/i }).check();
      cy.findByTestId("create-wallet").click().wait(15000);
      cy.visitAndCheck(`/home/${validUsername}`);

      // visit user profile page and validate wallet address
      cy.findByTestId("account-link").click().wait(2000);
      cy.url().should("include", `/${validUsername}`);
      cy.visitAndCheck(`/${validUsername}`);
      cy.findByTestId("account-wallet-address")
        .should("contain", `${validWalletAddress}`)
        .wait(2000);

      // clean up and create new oauth for testing unique username constraint
      cy.visitAndCheck("/");
      cy.cleanupOauth();
      cy.login(oauth.provider, oauth.userId);
      cy.visitAndCheck("/home/new");

      // validate unique username constraint
      cy.findByTestId("username").type(`${validUsername}`);
      cy.findByTestId("create-account").click().wait(5000);
      cy.findByText("username already taken").wait(1000);

      // cleanup the account
      cy.cleanupAccount(validUsername);
    });
  });
});
