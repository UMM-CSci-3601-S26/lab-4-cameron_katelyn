import { InventoryPage } from "../support/inv.po";

const page = new InventoryPage();
const Filters_Test = {
  Item: 'Markers',
  Brand: 'Crayola',
  Color: 'Red',
  Type: 'Washable',
  Size: 'Wide',
  Material: 'N/A',
}

describe('Inventory', () => {
  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    // Intercept the API call before navigating
    cy.intercept('GET', '/api/inventory*').as('getInventory');
    page.navigateTo();
    // Wait for the inventory data to load
    cy.wait('@getInventory');
    //nextTick(1000); // Alternate wait method, preferably wait on the API call instead
  });

  it('Should have the correct title', () => {
    page.getAppTitle().should('contain', 'Inventory');
  });

  it('Should display inventory items', () => {
    page.getSidenavButton().click();
    page.getNavLink('Inventory').click();
    cy.url().should('match', /\/inventory$/);
    page.getSidenav()
      .should('be.hidden');
    nextTick(1000)
    cy.contains('td', 'Test Item').should('exist'); // First item in the table
    // Note: Once 'test item' gets removed, this needs to be updated (possibly update to not check the first?)
  });

  it('Should have pagination controls', () => {
    page.getSidenavButton().click();
    page.getNavLink('Inventory').click();
    cy.url().should('match', /\/inventory$/);
    page.getSidenav()
      .should('be.hidden');
    cy.get('.mat-mdc-paginator').should('exist');
  });

  it('Should display all inventory column headers', () => {
    cy.get('.demo-table thead th').as('headers');

    cy.get('@headers').should('contain', 'Item');
    cy.get('@headers').should('contain', 'Description');
    cy.get('@headers').should('contain', 'Brand');
    cy.get('@headers').should('contain', 'Color');
    cy.get('@headers').should('contain', 'Size');
    cy.get('@headers').should('contain', 'Type');
    cy.get('@headers').should('contain', 'Material');
    cy.get('@headers').should('contain', 'Count');
    cy.get('@headers').should('contain', 'Quantity');
    cy.get('@headers').should('contain', 'Notes');
  });

  // Cypress tests to ensure the filter boxes (including clear button) are there
  // for all specification fields

  it('Should have specification filters', () => {
    page.getSidenavButton().click();
    page.getNavLink('Inventory').click();
    cy.url().should('match', /\/inventory$/);

    const errors: string[] = [];

    const recordError = (message: string) => {
      errors.push(message);
      cy.log(message);
      console.warn(message);
    }

    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="filter-item"]').length === 0) {
        recordError(`Empty filter input for Item`);
      }
      if ($body.find('[data-cy="filter-brand"]').length === 0) {
        recordError(`Empty filter input for Brand`);
      }
      if ($body.find('[data-cy="filter-color"]').length === 0) {
        recordError(`Empty filter input for Color`);
      }
      if ($body.find('[data-cy="filter-size"]').length === 0) {
        recordError(`Empty filter input for Size`);
      }
      if ($body.find('[data-cy="filter-type"]').length === 0) {
        recordError(`Empty filter input for Type`);
      }
      if ($body.find('[data-cy="filter-material"]').length === 0) {
        recordError(`Empty filter input for Material`);
      }
      if ($body.find('[data-cy="filter-clear"]').length === 0) {
        recordError(`Missing clear filters button`);
      }
    });

    cy.then(() => {
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
    });
  });

  it("Should be able to take an input and display the correct filtered results", () => {
    page.getSidenavButton().click();
    page.getNavLink('Inventory').click();
    cy.url().should('match', /\/inventory$/);

    // Intercept the filtered API calls
    cy.intercept('GET', '/api/inventory*').as('filterInventory');

    cy.get('[data-cy="filter-item"]').type(Filters_Test.Item);
    cy.get('[data-cy="filter-brand"]').type(Filters_Test.Brand);
    cy.get('[data-cy="filter-type"]').type(Filters_Test.Type);
    cy.get('[data-cy="filter-size"]').type(Filters_Test.Size);

    // Wait for the filtered results to load
    //cy.wait('@filterInventory');
    nextTick(1000);

    page.getInventoryRow().first().within(() => {
      cy.get('[data-cy="inventory-item"]').should('contain', Filters_Test.Item);
      cy.get('[data-cy="inventory-brand"]').should('contain', Filters_Test.Brand);
      cy.get('[data-cy="inventory-type"]').should('contain', Filters_Test.Type);
      cy.get('[data-cy="inventory-size"]').should('contain', Filters_Test.Size);
    });
  });

  it("Should be able to clear the filters via the button", () => {
    page.getSidenavButton().click();
    page.getNavLink('Inventory').click();
    cy.url().should('match', /\/inventory$/);

    // Intercept the filtered API calls
    cy.intercept('GET', '/api/inventory*').as('filterInventory');

    cy.get('[data-cy="filter-item"]').type(Filters_Test.Item);
    cy.get('[data-cy="filter-brand"]').type(Filters_Test.Brand);
    cy.get('[data-cy="filter-type"]').type(Filters_Test.Type);
    cy.get('[data-cy="filter-size"]').type(Filters_Test.Size);

    // Wait for the filtered results to load
    cy.wait('@filterInventory');
    //nextTick(1000); // Alternate wait method, preferably wait on the API call instead

    // Click the clear filters button
    cy.get('[data-cy="filter-clear"]').click();

    // Wait for the unfiltered results to load
    cy.wait('@filterInventory');
    //nextTick(1000); // Alternate wait method, preferably wait on the API call instead

    // Check that the first row is no longer the filtered item
    page.getInventoryRow().first().within(() => {
      cy.get('[data-cy="inventory-item"]').should('not.contain', Filters_Test.Item);
      cy.get('[data-cy="inventory-brand"]').should('not.contain', Filters_Test.Brand);
      cy.get('[data-cy="inventory-type"]').should('not.contain', Filters_Test.Type);
      cy.get('[data-cy="inventory-size"]').should('not.contain', Filters_Test.Size);
    });
  });

  // DELETE TESTS

  it('Should display delete menu option when clicking row menu button', () => {
    // Click the menu button on the first row
    page.getInventoryRow().first().within(() => {
      cy.get('button[mat-icon-button]').first().click();
    });

    // Verify the Delete menu item appears
    cy.get('.mat-mdc-menu-panel').should('be.visible');
    cy.get('button[mat-menu-item]').within(() => {
      cy.contains('Delete').should('be.visible');
    });

    // Verify it has a delete icon
    cy.get('button[mat-menu-item]').contains('Delete')
      .parent()
      .find('mat-icon')
      .should('contain', 'delete');
  });

  it('Should be able to delete an inventory item', () => {
    // Get the item name from the first row before deletion
    let itemToDelete: string;
    page.getInventoryRow().first().within(() => {
      cy.get('[data-cy="inventory-item"]')
        .invoke('text')
        .then((text) => {
          itemToDelete = text.trim();
        });
    });

    // Click the menu button on the first row
    page.getInventoryRow().first().within(() => {
      cy.get('button[mat-icon-button]').first().click();
    });

    // Click the Delete option

    // Confirm the deletion in the browser dialog
    cy.on('window:confirm', () => true);

    // Wait for the DELETE API call
    cy.intercept('DELETE', '/api/inventory/*').as('deleteInventory');
    cy.wait('@deleteInventory');

    // Verify the item is no longer in the table
    cy.get('body').then(($body) => {
      // Check that the deleted item is not visible
      if ($body.find('td').length > 0) {
        cy.contains('td', itemToDelete).should('not.exist');
      }
    });
  });

  it('Should update row count after deletion', () => {
    // Get initial row count
    let initialRowCount: number;
    page.getInventoryRow().then(($rows) => {
      initialRowCount = $rows.length;
    });

    // Delete the first item
    page.getInventoryRow().first().within(() => {
      cy.get('button[mat-icon-button]').first().click();
    });

    page.getDeleteMenuItem().click();

    // Handle the confirmation dialog
    cy.on('window:confirm', () => true);

    // Wait for the DELETE request
    cy.intercept('DELETE', '/api/inventory/*').as('deleteInventory');
    cy.wait('@deleteInventory');

    // Wait a moment for the UI to update
    nextTick(500);

    // Verify the row count decreased by 1
    page.getInventoryRow().then(($rows) => {
      expect($rows.length).to.equal(initialRowCount - 1);
    });
  });

  it('Should cancel delete when user declines confirmation', () => {
    // Get initial row count
    let initialRowCount: number;
    page.getInventoryRow().then(($rows) => {
      initialRowCount = $rows.length;
    });

    // Get the first item's text
    let itemName: string;
    page.getInventoryRow().first().within(() => {
      cy.get('[data-cy="inventory-item"]')
        .invoke('text')
        .then((text) => {
          itemName = text.trim();
        });
    });

    // Click the menu button on the first row
    page.getInventoryRow().first().within(() => {
      cy.get('button[mat-icon-button]').first().click();
    });

    // Click the Delete option
    page.getDeleteMenuItem().click();

    // Decline the confirmation (return false)
    cy.on('window:confirm', () => false);

    // Wait a moment
    nextTick(500);

    // Verify:
    // 1. Row count hasn't changed
    page.getInventoryRow().then(($rows) => {
      expect($rows.length).to.equal(initialRowCount);
    });

    // 2. Item is still in the table
    cy.contains('td', itemName).should('exist');
  });

  // Note: The below test should remain empty until a finalized inventory list JSON is used to seed the database.

  // it('should report all empty cells across all pages', () => {
  //   page.getSidenavButton().click();
  //   page.getNavLink('Inventory').click();
  //   cy.url().should('match', /\/inventory$/);

  //   const errors: string[] = [];

  //   const assertNoEmptyCellsOnCurrentPage = (pageLabel: string) => {
  //     cy.get('.demo-table tbody tr')
  //       .each(($row, rowIndex) => {
  //         cy.wrap($row)
  //           .find('td')
  //           .each(($cell, colIndex) => {
  //             cy.wrap($cell)
  //               .invoke('text')
  //               .then((text) => {
  //                 const value = text.replace(/\s+/g, ' ').trim();

  //                 if (value === '') {
  //                   const message = `Empty cell at ${pageLabel} | Row ${rowIndex + 1}, Col ${colIndex + 1}`;
  //                   errors.push(message);
  //                   cy.log(message);
  //                   console.warn(message);
  //                 }
  //               });
  //           });
  //       });
  //   };

  //   const getRangeLabel = () =>
  //     cy.get('.mat-mdc-paginator-range-label, .mat-paginator-range-label')
  //       .invoke('text')
  //       .then(t => t.replace(/\s+/g, ' ').trim());

  //   const clickNextIfPossible = () => {
  //     cy.get('button[aria-label="Next page"], button[aria-label="next page"]')
  //       .first()
  //       .then(($btn) => {
  //         const disabled =
  //         $btn.is(':disabled') ||
  //         $btn.attr('disabled') !== undefined ||
  //         $btn.attr('aria-disabled') === 'true';

  //         if (disabled) return;

  //         getRangeLabel().then(() => {
  //           cy.wrap($btn).click();

  //           getRangeLabel().then((after) => {
  //             assertNoEmptyCellsOnCurrentPage(after);
  //             clickNextIfPossible();
  //           });
  //         });
  //       });
  //   };

  //   getRangeLabel().then((label) => {
  //     assertNoEmptyCellsOnCurrentPage(label);
  //     clickNextIfPossible();
  //   });

  //   cy.then(() => {
  //     if (errors.length > 0) {
  //       throw new Error(
  //         `Found ${errors.length} empty cells:\n\n` + errors.join('\n')
  //       );
  //     }
  //   });
  // });
});

function nextTick(ms: number) {
  cy.wait(ms);
}
