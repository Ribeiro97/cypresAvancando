describe('Formulario de Login', ()=>{

  
  it('Deve acessar a página home', () => {
    cy.login('neilton@alura.com', '123456');
    cy.visit('/home');
    cy.getByData('titulo-boas-vindas').should('contain', 'Bem vindo de volta');
    cy.url().should('contain', '/home');
  });

  it('Não deve permitir um email inválido', ()=>{        

    cy.login('wewewa@gege', '123456');
    cy.getByData('mensagem-erro').should('exist').and('have.text', 'O email digitado é inválido');
  })

  it('Não deve permitir um campo em branco', ()=>{

    cy.login(' ', '123456');
    cy.getByData('mensagem-erro').should('exist').and('have.text', 'O campo email é obrigatório');
  })
})