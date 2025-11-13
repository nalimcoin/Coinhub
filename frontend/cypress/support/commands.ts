// Custom commands for authentication

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('register', (firstName: string, lastName: string, email: string, password: string) => {
  cy.visit('/register');
  cy.get('#firstName').type(firstName);
  cy.get('#lastName').type(lastName);
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

export {};
