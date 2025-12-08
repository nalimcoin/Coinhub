describe('Gestion des categories', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('azerAZER1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard', { timeout: 10000 });
  });

  it('devrait creer une categorie, la verifier, puis la supprimer', () => {
    cy.contains('Catégories').click();
    cy.url().should('include', '/categories');
    cy.contains('Mes Catégories').should('be.visible');

    cy.contains('Créer une catégorie').click();

    const nomCategorie = 'Categorie Test E2E ' + Date.now();
    cy.get('#name').type(nomCategorie);
    cy.get('#description').type('Description test categorie');
    cy.get('#color').invoke('val', '#FF6B6B').trigger('change');

    cy.get('button[type="submit"]').click();

    cy.contains(nomCategorie, { timeout: 10000 }).should('be.visible');
    cy.contains('Description test categorie').should('be.visible');

    cy.contains(nomCategorie).parent().parent().within(() => {
      cy.contains('🗑️').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains(nomCategorie, { timeout: 10000 }).should('not.exist');
  });

  it('devrait annuler la creation d\'une categorie', () => {
    cy.contains('Catégories').click();
    cy.url().should('include', '/categories');
    cy.contains('Mes Catégories').should('be.visible');

    cy.contains('Créer une catégorie').click();

    const nomCategorie = 'Categorie Annulee ' + Date.now();
    cy.get('#name').type(nomCategorie);
    cy.get('#description').type('Cette categorie ne devrait pas etre creee');
    cy.get('#color').invoke('val', '#3cb44b').trigger('change');

    cy.contains('button', 'Annuler').click();

    cy.contains('h2', 'Créer une catégorie').should('not.exist');

    cy.contains(nomCategorie).should('not.exist');
  });
});
