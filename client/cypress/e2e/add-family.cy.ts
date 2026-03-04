import { Family } from 'src/app/family/family';
import { AddFamilyPage } from '../support/add-family.po';

describe('Add family', () => {
  const page = new AddFamilyPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Family');
  });

  it('Should enable and disable the add family button', () => {
    // ADD USER button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addFamilyButton().should('be.disabled');
    page.getFormField('guardianName').type('test');
    page.addFamilyButton().should('be.disabled');
    page.getFormField('address').type('123 Street');
    page.addFamilyButton().should('be.disabled');
    page.getFormField('timeSlot').type('9:00-10:00');
    page.addFamilyButton().should('be.disabled');
    page.getFormField('email').clear().type('familytest@email.com');

    //page.addStudentButton().click(); may not need to be clicked first
    page.getStudentField(0, 'name').type('Example Student');
    page.getStudentField(0, 'grade').type('1');
    page.getStudentField(0, 'school').type('Morris Elementary');
    page.getStudentField(0, 'requestedSupplies').type('pencils');

    // all the required fields have valid input, then it should be enabled
    page.addFamilyButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=guardianNameError]').should('not.exist');
    // Just clicking the guardian name field without entering anything should cause an error message
    page.getFormField('guardianName').click().blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    // Some more tests for various invalid guardian name inputs
    page.getFormField('guardianName').type('J').blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    page
      .getFormField('guardianName')
      .clear()
      .type('This is a very long name that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=guardianNameError]').should('exist').and('be.visible');
    // Entering a valid guardian name should remove the error.
    page.getFormField('guardianName').clear().type('John Smith').blur();
    cy.get('[data-test=guardianNameError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=addressError]').should('not.exist');
    // Just clicking the address field without entering anything should cause an error message
    page.getFormField('address').click().blur();
    // Some more tests for invalid address inputs
    cy.get('[data-test=addressError]').should('exist').and('be.visible');
    page.getFormField('address').type('').blur();
    // Entering a valid address should remove the error.
    page.getFormField('address').clear().type('123 Street').blur();
    cy.get('[data-test=addressError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=emailError]').should('not.exist');
    // Just clicking the email field without entering anything should cause an error message
    page.getFormField('email').click().blur();
    // Some more tests for various invalid email inputs
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').type('asd').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    page.getFormField('email').clear().type('@example.com').blur();
    cy.get('[data-test=emailError]').should('exist').and('be.visible');
    // Entering a valid email should remove the error.
    page.getFormField('email').clear().type('family@example.com').blur();
    cy.get('[data-test=emailError]').should('not.exist');
  });

  describe('Adding a new family', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const family: Family = {
        _id: null,
        name: 'Test Family',
        age: 30,
        company: 'Test Company',
        email: 'test@example.com',
        role: 'editor',
      };

      // The `page.addFamily(family)` call ends with clicking the "Add Family"
      // button on the interface. That then leads to the client sending an
      // HTTP request to the server, which has to process that request
      // (including making calls to add the family to the database and wait
      // for those to respond) before we get a response and can update the GUI.
      // By calling `cy.intercept()` we're saying we want Cypress to "notice"
      // when we go to `/api/families`. The `AddFamilyComponent.submitForm()` method
      // routes to `/api/families/{MongoDB-ID}` if the REST request to add the family
      // succeeds, and that routing will get "noticed" by the Cypress because
      // of the `cy.intercept()` call.
      //
      // The `.as('addFamily')` call basically gives that event a name (`addFamily`)
      // which we can use in things like `cy.wait()` to say which event or events
      // we want to wait for.
      //
      // The `cy.wait('@addFamily')` tells Cypress to wait until we have successfully
      // routed to `/api/families` before we continue with the following checks. This
      // hopefully ensures that the server (and database) have completed all their
      // work, and that we should have a properly formed page on the client end
      // to check.
      cy.intercept('/api/families').as('addFamily');
      page.addFamily(family);
      cy.wait('@addFamily');

      // New URL should end in the 24 hex character Mongo ID of the newly added family.
      // We'll wait up to five full minutes for this these `should()` assertions to succeed.
      // Hopefully that long timeout will help ensure that our Cypress tests pass in
      // GitHub Actions, where we're often running on slow VMs.
      cy.url({ timeout: 300000 })
        .should('match', /\/families\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/families\/new$/);

      // The new family should have all the same attributes as we entered
      cy.get('.family-card-name').should('have.text', family.name);
      cy.get('.family-card-company').should('have.text', family.company);
      cy.get('.family-card-role').should('have.text', family.role);
      cy.get('.family-card-age').should('have.text', family.age);
      cy.get('.family-card-email').should('have.text', family.email);

      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added family ${family.name}`);
    });

    it('Should fail with no company', () => {
      const family: Family = {
        _id: null,
        name: 'Test Family',
        age: 30,
        company: null, // The company being set to null means nothing will be typed for it
        email: 'test@example.com',
        role: 'editor',
      };

      // Here we're _not_ expecting to route to `/api/families` since adding this
      // family should fail. So we don't add `cy.intercept()` and `cy.wait()` calls
      // around this `page.addFamily(family)` call. If we _did_ add them, the test wouldn't
      // actually fail because a `cy.wait()` that times out isn't considered a failure,
      // although we could catch the timeout and turn it into a failure if we needed to.
      page.addFamily(family);

      // We should get an error message
      page.getSnackBar().should('contain', 'Tried to add an illegal new family');

      // We should have stayed on the new family page
      cy.url()
        .should('not.match', /\/families\/[0-9a-fA-F]{24}$/)
        .should('match', /\/families\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('name').should('have.value', family.name);
      page.getFormField('age').should('have.value', family.age);
      page.getFormField('email').should('have.value', family.email);
      page.getFormField('role').should('contain', 'Editor');
    });
  });
});
