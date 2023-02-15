describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
    cy.cleanupAccount({ username: "silverstar" });
  });

  it("should allow you to register and login", () => {
    cy.login();
    cy.visitAndCheck("/home/new", 3000);
    cy.get("#username").type("silverstar");
    cy.findByTestId("account-create").click();
    cy.visitAndCheck("/");
    // cy.visitAndCheck("/home/silverstar/wallet/new", 10000);
    // cy.findByTestId("new-wallet-address").type(
    //   "0xe32C26Be24232ba92cd89d116985F81f94Dd26a8"
    // );
    // cy.findByTestId("new-wallet-create").click();
  });
});
