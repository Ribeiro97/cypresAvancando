Cypress.Commands.add('getByData', (seletor) => {
  return cy.get(`[data-test=${seletor}]`)
});


Cypress.Commands.add('login', (email, senha) => {
  cy.visit('/');
  cy.getByData('botao-login').click();
  cy.getByData('email-input').type(email);
  cy.getByData('senha-input').type(senha);
  cy.getByData('botao-enviar').click();
});


Cypress.Commands.add('primeiroUsuario', () => {
  cy.request('GET', 'http://localhost:8000/users').then((response) => {
    return response.body[6];
  });
});