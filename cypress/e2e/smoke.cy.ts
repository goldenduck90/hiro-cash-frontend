describe("smoke tests", () => {
  afterEach(() => {
    cy.fixture("accounts").then((accounts) => {
      cy.cleanupUser(accounts.provider, accounts.userId1);
      cy.cleanupAccount(accounts.username);
    });
  });

  it("should allow you to register and login, create an account and a wallet", () => {
    cy.fixture("accounts").then((accounts) => {
      cy.visitAndCheck("/");
      cy.login(accounts.provider, accounts.userId1);

      cy.visitAndCheck("/home/new");
      cy.get("#username").type(accounts.username);
      cy.findByTestId("account-create").click();
      cy.wait(15000);

      cy.visitAndCheck("/home/silverstar/wallet/new");
      cy.findByTestId("new-wallet-address").type(accounts.userId1);
      cy.findByRole("checkbox", { name: /usdt/i }).check();
      cy.findByTestId("new-wallet-create").click();
      cy.wait(15000);

      cy.visitAndCheck("/home/silverstar");
    });
  });

  it("check unique username constraint", () => {
    cy.fixture("accounts").then((accounts) => {
      cy.visitAndCheck("/");
      cy.login(accounts.provider, accounts.userId1);

      cy.visitAndCheck("/home/new");
      cy.get("#username").type("silverstar");
      cy.findByTestId("account-create").click();
      cy.wait(20000);
      cy.clearCookie("__session");

      cy.login(accounts.provider, accounts.userId2);

      cy.visitAndCheck("/home/new");
      cy.get("#username").type("silverstar");
      cy.findByTestId("account-create").click();
      cy.wait(10000);

      cy.findByText("username already taken");

      cy.cleanupUser(accounts.provider, accounts.userId2);
    });
  });

  it("Wallet address validation", () => {
    cy.fixture("accounts").then((accounts) => {
      cy.visitAndCheck("/");
      cy.login(accounts.provider, accounts.userId1);

      cy.visitAndCheck("/home/new");
      cy.get("#username").type("silverstar");
      cy.findByTestId("account-create").click();
      cy.wait(20000);

      cy.visitAndCheck("/home/silverstar/wallet/new");
      cy.findByTestId("new-wallet-address").type("Wrong wallet address!");
      cy.findByRole("checkbox", { name: /usdt/i }).check();
      cy.findByTestId("new-wallet-create").click();
      cy.wait(5000);

      cy.findByText("must be a valid ethereum address.");
    });
  });
});
