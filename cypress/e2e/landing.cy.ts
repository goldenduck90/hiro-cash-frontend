describe("The landing page Test", () => {
  it("successfully loads", () => {
    cy.visitAndCheck("/", 3000);
    cy.findByTestId("header-logo").should("exist");
    cy.findByTestId("login-button").should("exist").click();

    // login modal
    cy.findByTestId("login-google-button").should("exist");
    cy.findByTestId("login-twitter-button").should("exist");
    cy.findByTestId("login-github-button").should("exist");
  });
});
