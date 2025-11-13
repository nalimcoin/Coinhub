describe('Page de connexion', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Affichage de la page', () => {
    it('devrait afficher tous les éléments de la page', () => {
      cy.get('img[alt="CoinHub Logo"]').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Se connecter');
      cy.contains('Créer un compte').should('be.visible');
    });
  });

  describe('Formulaire non valide', () => {
    it('ne devrait pas soumettre le formulaire avec des champs vides', () => {
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });

    it('ne devrait pas soumettre le formulaire avec seulement l\'email', () => {
      cy.get('#email').type('test@example.com');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });

    it('ne devrait pas soumettre le formulaire avec seulement le mot de passe', () => {
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait permettre la saisie dans les champs', () => {
      const email = 'user@example.com';
      const password = 'password123';

      cy.get('#email').type(email).should('have.value', email);
      cy.get('#password').type(password).should('have.value', password);
    });

    it('devrait désactiver les champs pendant la soumission', () => {
      cy.intercept('POST', '**/login', (req) => {
        req.reply({
          statusCode: 200,
          delay: 500,
          body: {
            user: {
              id: 1,
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            },
            token: 'fake-jwt-token'
          }
        });
      }).as('loginRequest');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      cy.get('#email').should('be.disabled');
      cy.get('#password').should('be.disabled');

      cy.wait('@loginRequest');
    });

    it('devrait afficher un message d\'erreur en cas d\'identifiants invalides', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: {
          message: 'Email ou mot de passe incorrect'
        }
      }).as('loginRequest');

      cy.get('#email').type('wrong@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.get('.bg-red-100').should('be.visible');
      cy.contains('Email ou mot de passe incorrect').should('be.visible');
    });

    it('devrait rediriger vers le dashboard après une connexion réussie', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: {
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          },
          token: 'fake-jwt-token'
        }
      }).as('loginRequest');

      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.url().should('include', '/dashboard');
    });
  });
});
