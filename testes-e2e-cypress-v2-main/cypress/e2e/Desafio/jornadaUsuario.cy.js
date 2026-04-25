describe('Jornadas de usuário', () => {
  beforeEach(() => {
    // interceptando as API'S
    cy.intercept('PUT', '**/users/**/saldo').as('putSaldo');
    cy.intercept('POST', '**/users/**/transations').as('postTransations');
  });
  
  
  it('Deve permitir que a pessoa usuária acesse a aplicação, realize uma transação e faça um logout', () => {
    
    // Acessando a página inicial do site
    cy.visit('/');

    // Pegando o primeiro usuário da base de dados mais atualizado
    cy.primeiroUsuario().then((user) => {
      // Armazenando o usuário em uma variável para usar posteriormente
      cy.wrap(user).as('usuario');
       
      // Login do usuario
      cy.login(user.email, user.senha);
      
      // Verificando se a pessoa usuária foi redirecionada para a página home
      cy.location('pathname').should('eq', '/home');
    });

    // Seleciona Transferencia no select de opções
    cy.getByData('select-opcoes').select('Transferência');
    // Informando o valor da transação
    cy.getByData('form-input').type('85');
    // Clicando no botão de realizar transação
    cy.getByData('realiza-transacao').click();
    
    cy.get('@usuario').then((usuario) => {        
      // Verificando se a transação foi realizada com sucesso
      cy.wait('@putSaldo').then((interception) => {
        // Validando o status
        expect(interception.response.statusCode).to.eq(200);
        // Validando as propriedades do corpo do response
        expect(interception.response.body).to.have.property('email', usuario.email);
        expect(interception.response.body).to.have.property('nome', usuario.nome);
      });
    });


    cy.wait('@postTransations').its('response.statusCode').should('eq', 200);
  
    cy.getByData('lista-transacoes').find('li').last().contains('- R$ 85');
    cy.getByData('botao-sair').should('be.visible').click();
    cy.location('pathname').should('eq', '/');
  });
});
