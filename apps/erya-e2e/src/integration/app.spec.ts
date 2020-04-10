import { getGreeting, getSearchBox } from '../support/app.po';

describe('erya', () => {
  beforeEach(() => cy.visit('/search'));

  it('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    cy.login('my-email@something.com', 'myPassword');

    // getGreeting().contains('Welcome to erya!');
    getSearchBox().should('have.attr', 'placeholder', 'Type word to start search');
  });
});
