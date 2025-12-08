describe('Gestion des transactions', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('azerAZER1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('devrait creer une transaction, la verifier, puis la supprimer avec le compte', () => {
    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');
    cy.contains('Mes Comptes').should('be.visible');

    cy.contains('Créer un compte').click();

    const nomCompte = 'Compte Transaction Test ' + Date.now();
    cy.get('#name').type(nomCompte);
    cy.get('#initialBalance').type('500');
    cy.get('#currency').select('EUR');

    cy.get('button[type="submit"]').click();

    cy.contains(nomCompte, { timeout: 10000 }).should('be.visible');

    cy.contains(nomCompte).click();

    cy.contains('button', 'Nouvelle transaction').click();

    cy.get('#amount').type('50');
    cy.get('#category').select(1);
    cy.get('#description').type('Transaction test E2E');

    cy.get('button[type="submit"]').click();

    cy.contains('Transaction test E2E', { timeout: 10000 }).should('be.visible');

    cy.contains('Transaction test E2E').closest('div.flex.items-center.justify-between').within(() => {
      cy.get('button[title="Supprimer"]').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains('Transaction test E2E', { timeout: 10000 }).should('not.exist');

    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');

    cy.contains(nomCompte).parent().parent().within(() => {
      cy.contains('🗑️').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains(nomCompte, { timeout: 10000 }).should('not.exist');
  });

  it('devrait annuler la creation d\'une transaction', () => {
    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');
    cy.contains('Mes Comptes').should('be.visible');

    cy.contains('Créer un compte').click();

    const nomCompte = 'Compte Annulation Test ' + Date.now();
    cy.get('#name').type(nomCompte);
    cy.get('#initialBalance').type('300');
    cy.get('#currency').select('EUR');

    cy.get('button[type="submit"]').click();

    cy.contains(nomCompte, { timeout: 10000 }).should('be.visible');

    cy.contains(nomCompte).click();

    cy.contains('button', 'Nouvelle transaction').click();

    const descriptionTransaction = 'Transaction annulee ' + Date.now();
    cy.get('#amount').type('75');
    cy.get('#category').select(1);
    cy.get('#description').type(descriptionTransaction);

    cy.contains('button', 'Annuler').click();

    cy.contains('h2', 'Créer une transaction').should('not.exist');

    cy.contains(descriptionTransaction).should('not.exist');

    cy.contains('Comptes').click();
    cy.url().should('include', '/accounts');

    cy.contains(nomCompte).parent().parent().within(() => {
      cy.contains('🗑️').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains(nomCompte, { timeout: 10000 }).should('not.exist');
  });
});
