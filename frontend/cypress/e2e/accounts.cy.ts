describe('Gestion des comptes', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('azerAZER1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('devrait créer un compte, le vérifier, puis le supprimer', () => {
    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');
    cy.contains('Mes Comptes').should('be.visible');

    cy.contains('Créer un compte').click();

    const nomCompte = 'Compte Test E2E ' + Date.now();
    cy.get('#name').type(nomCompte);
    cy.get('#initialBalance').type('1000');
    cy.get('#currency').select('EUR');

    cy.get('button[type="submit"]').click();

    cy.contains(nomCompte, { timeout: 10000 }).should('be.visible');
    cy.contains('1000.00 EUR').should('be.visible');

    cy.contains(nomCompte).parent().parent().within(() => {
      cy.contains('🗑️').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains(nomCompte, { timeout: 10000 }).should('not.exist');
  });

  it('devrait annuler la création d\'un compte', () => {
    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');
    cy.contains('Mes Comptes').should('be.visible');

    cy.contains('Créer un compte').click();

    const nomCompte = 'Compte Annulé ' + Date.now();
    cy.get('#name').type(nomCompte);
    cy.get('#initialBalance').type('500');
    cy.get('#currency').select('USD');

    cy.contains('button', 'Annuler').click();

    cy.contains('h2', 'Créer un compte').should('not.exist');

    cy.contains(nomCompte).should('not.exist');
  });
});
