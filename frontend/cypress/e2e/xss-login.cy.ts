describe('Tests de sécurité XSS - Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
  ];

  describe('Injection XSS dans le champ email', () => {
    xssPayloads.forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans l'email`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/login', {
          statusCode: 400,
          body: {
            error: `Email invalide: ${payload}`,
          },
        }).as('loginRequest');

        cy.get('#email').type(payload);
        cy.get('#password').type('Password123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');

        cy.get('.bg-red-100').should('be.visible');
        cy.get('.bg-red-100').should('not.contain.html', '<script>');
        cy.get('.bg-red-100').should('not.contain.html', '<img');
        cy.get('.bg-red-100').should('not.contain.html', 'javascript:');
      });
    });
  });

  describe('Injection XSS dans le champ mot de passe', () => {
    xssPayloads.slice(0, 5).forEach((payload, index) => {
      it(`ne devrait pas exécuter le payload XSS #${index + 1} dans le mot de passe`, () => {
        cy.on('window:alert', () => {
          throw new Error('XSS alert détecté - Test échoué!');
        });

        cy.intercept('POST', '**/login', {
          statusCode: 400,
          body: {
            error: 'Identifiants invalides',
          },
        }).as('loginRequest');

        cy.get('#email').type('test@example.com');
        cy.get('#password').type(payload);
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');

        cy.get('.bg-red-100').should('be.visible');
      });
    });
  });
});
