import { FamilyListPage } from '../support/family-list.po';

const page = new FamilyListPage();

describe('Family list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getFamilyTitle().should('have.text', 'Families');
  });

  it('Should show 10 families in both card and list view', () => {
    page.getFamilyCards().should('have.length', 10);
    page.changeView('list');
    page.getFamilyListItems().should('have.length', 10);
  });

  it('Should type something in the name filter and check that it returned correct elements', () => {
    // Filter for family 'Lynn Ferguson'
    cy.get('[data-test=familyNameInput]').type('Lynn Ferguson');

    // All of the family cards should have the name we are filtering by
    page.getFamilyCards().each(e => {
      cy.wrap(e).find('.family-card-name').should('have.text', 'Lynn Ferguson');
    });

    // (We check this two ways to show multiple ways to check this)
    page.getFamilyCards().find('.family-card-name').each(el =>
      expect(el.text()).to.equal('Lynn Ferguson')
    );
  });

  it('Should type something in the company filter and check that it returned correct elements', () => {
    // Filter for company 'OHMNET'
    cy.get('[data-test=familyCompanyInput]').type('OHMNET');

    page.getFamilyCards().should('have.lengthOf.above', 0);

    // All of the family cards should have the company we are filtering by
    page.getFamilyCards().find('.family-card-company').each(card => {
      cy.wrap(card).should('have.text', 'OHMNET');
    });
  });

  it('Should type something partial in the company filter and check that it returned correct elements', () => {
    // Filter for companies that contain 'ti'
    cy.get('[data-test=familyCompanyInput]').type('ti');

    page.getFamilyCards().should('have.lengthOf', 2);

    // Each family card's company name should include the text we are filtering by
    page.getFamilyCards().each(e => {
      cy.wrap(e).find('.family-card-company').should('include.text', 'TI');
    });
  });

  it('Should type something in the age filter and check that it returned correct elements', () => {
    // Filter for families of age '27'
    cy.get('[data-test=familyAgeInput]').type('27');

    page.getFamilyCards().should('have.lengthOf', 3);

    // Go through each of the cards that are being shown and get the names
    page.getFamilyCards().find('.family-card-name')
      // We should see these families whose age is 27
      .should('contain.text', 'Stokes Clayton')
      .should('contain.text', 'Bolton Monroe')
      .should('contain.text', 'Merrill Parker')
      // We shouldn't see these families
      .should('not.contain.text', 'Connie Stewart')
      .should('not.contain.text', 'Lynn Ferguson');
  });

  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getFamilyCards().should('not.exist');
    page.getFamilyListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getFamilyCards().should('exist');
    page.getFamilyListItems().should('not.exist');
  });

  it('Should select a role, switch the view, and check that it returned correct elements', () => {
    // Filter for role 'viewer');
    page.selectRole('viewer');

    // Choose the view type "List"
    page.changeView('list');

    // Some of the families should be listed
    page.getFamilyListItems().should('have.lengthOf.above', 0);

    // All of the family list items that show should have the role we are looking for
    page.getFamilyListItems().each(el => {
      cy.wrap(el).find('.family-list-role').should('contain', 'viewer');
    });
  });

  it('Should click view profile on a family and go to the right URL', () => {
    page.getFamilyCards().first().then((card) => {
      const firstFamilyName = card.find('.family-card-name').text();
      const firstFamilyCompany = card.find('.family-card-company').text();

      // When the view profile button on the first family card is clicked, the URL should have a valid mongo ID
      page.clickViewProfile(page.getFamilyCards().first());

      // The URL should be '/families/' followed by a mongo ID
      cy.url().should('match', /\/families\/[0-9a-fA-F]{24}$/);

      // On this profile page we were sent to, the name and company should be correct
      cy.get('.family-card-name').first().should('have.text', firstFamilyName);
      cy.get('.family-card-company').first().should('have.text', firstFamilyCompany);
    });
  });

  it('Should click add family and go to the right URL', () => {
    // Click on the button for adding a new family
    page.addFamilyButton().click();

    // The URL should end with '/families/new'
    cy.url().should(url => expect(url.endsWith('/families/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-family-title').should('have.text', 'New Family');
  });

});
