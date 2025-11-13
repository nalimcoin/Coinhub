describe('Tests de sécurité XSS - Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
  ];

  describe('Injection XSS dans le champ prénom', () => {
    xssPayloads.slice(0, 5).forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans le prénom`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/register', {
          statusCode: 400,
          body: {
            error: 'Prénom invalide',
          },
        }).as('registerRequest');

        cy.get('#firstName').type(payload);
        cy.get('#lastName').type('Doe');
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('Password123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerRequest');

        cy.get('.bg-red-100').should('be.visible');
      });
    });
  });

  describe('Injection XSS dans le champ nom', () => {
    xssPayloads.slice(0, 5).forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans le nom`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/register', {
          statusCode: 400,
          body: {
            error: 'Nom invalide',
          },
        }).as('registerRequest');

        cy.get('#firstName').type('John');
        cy.get('#lastName').type(payload);
        cy.get('#email').type('test@example.com');
        cy.get('#password').type('Password123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerRequest');

        cy.get('.bg-red-100').should('be.visible');
      });
    });
  });

  describe('Injection XSS dans le champ email', () => {
    xssPayloads.slice(0, 5).forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans l'email`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/register', {
          statusCode: 400,
          body: {
            error: `Email invalide: ${payload}`,
          },
        }).as('registerRequest');

        cy.get('#firstName').type('John');
        cy.get('#lastName').type('Doe');
        cy.get('#email').type(payload);
        cy.get('#password').type('Password123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerRequest');

        cy.get('.bg-red-100').should('be.visible');
        cy.get('.bg-red-100').should('not.contain.html', '<script>');
        cy.get('.bg-red-100').should('not.contain.html', '<img');
      });
    });
  });

  describe('Injection XSS dans le champ mot de passe', () => {
    xssPayloads.slice(0, 3).forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans le mot de passe`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/register', {
          statusCode: 400,
          body: {
            error: 'Mot de passe invalide',
          },
        }).as('registerRequest');

        cy.get('#firstName').type('John');
        cy.get('#lastName').type('Doe');
        cy.get('#email').type('test@example.com');
        cy.get('#password').type(payload);
        cy.get('button[type="submit"]').click();

        cy.wait('@registerRequest');

        cy.get('.bg-red-100').should('be.visible');
      });
    });
  });
});
