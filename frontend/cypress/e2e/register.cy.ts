describe('Page d\'inscription', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  describe('Affichage de la page', () => {
    it('devrait afficher tous les éléments de la page', () => {
      cy.get('img[alt="CoinHub Logo"]').should('be.visible');
      cy.get('#firstName').should('be.visible');
      cy.get('#lastName').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').and('contain', "S'inscrire");
      cy.contains('Déjà un compte').should('be.visible');
    });
  });

  describe('Formulaire non valide', () => {
    it('ne devrait pas soumettre le formulaire avec des champs vides', () => {
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('ne devrait pas soumettre le formulaire avec seulement le prénom', () => {
      cy.get('#firstName').type('John');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('ne devrait pas soumettre le formulaire avec seulement l\'email', () => {
      cy.get('#email').type('test@example.com');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('ne devrait pas soumettre le formulaire avec seulement le mot de passe', () => {
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });

    it('ne devrait pas soumettre le formulaire sans le nom', () => {
      cy.get('#firstName').type('John');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait permettre la saisie dans tous les champs', () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john.doe@example.com';
      const password = 'Password123!';

      cy.get('#firstName').type(firstName).should('have.value', firstName);
      cy.get('#lastName').type(lastName).should('have.value', lastName);
      cy.get('#email').type(email).should('have.value', email);
      cy.get('#password').type(password).should('have.value', password);
    });

    it('devrait désactiver les champs pendant la soumission', () => {
      cy.intercept('POST', '**/register', (req) => {
        req.reply({
          statusCode: 201,
          delay: 500,
          body: {
            user: {
              id: 1,
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe'
            },
            token: 'fake-jwt-token'
          }
        });
      }).as('registerRequest');

      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.get('#firstName').should('be.disabled');
      cy.get('#lastName').should('be.disabled');
      cy.get('#email').should('be.disabled');
      cy.get('#password').should('be.disabled');

      cy.wait('@registerRequest');
    });

    it('devrait afficher un message d\'erreur si l\'email existe déjà', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: {
          error: 'Email already exists'
        }
      }).as('registerRequest');

      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('existing@example.com');
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.get('.bg-red-100').should('be.visible');
    });

    it('devrait afficher un message d\'erreur pour un email invalide', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: {
          error: 'Invalid email format'
        }
      }).as('registerRequest');

      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('invalid-email');
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.get('.bg-red-100').should('be.visible');
    });

    it('devrait rediriger vers le dashboard après une inscription réussie', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 201,
        body: {
          user: {
            id: 1,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe'
          },
          token: 'fake-jwt-token'
        }
      }).as('registerRequest');

      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');

      cy.url().should('include', '/dashboard');
    });
  });
});
