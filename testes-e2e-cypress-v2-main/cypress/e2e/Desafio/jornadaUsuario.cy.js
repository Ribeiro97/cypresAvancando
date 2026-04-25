describe('Jornadas de usuário', () => {
  beforeEach(() => {
    // interceptando as API'S
    cy.intercept('PUT', '**/users/**/saldo').as('putSaldo');
    cy.intercept('POST', '**/users/**/transations').as('postTransations');
    cy.intercept('POST', '**/users/login').as('postLogin');
  });
  
  
  it('Deve permitir que a pessoa usuária acesse a aplicação, realize uma transação e faça um logout', () => {
    const informacoes = {
      tipoMovimentacao: "Transferência",
      valorTransacao: 85
    }
    
    // Acessando a página inicial do site
    cy.visit('/');

    // Pegando o primeiro usuário da base de dados mais atualizado
    cy.primeiroUsuario().then((user) => {
      // Armazenando o usuário em uma variável para usar posteriormente
      cy.wrap(user).as('usuario');
       
      // Login do usuario
      cy.login(user.email, user.senha);

      cy.wait('@postLogin').then((intercept) => {
        // validando status
        expect(intercept.response.statusCode).to.eq(200);
      });
      
      // Verificando se a pessoa usuária foi redirecionada para a página home
      cy.location('pathname').should('eq', '/home');
    });

    // Seleciona Transferencia no select de opções
    cy.getByData('select-opcoes').select(informacoes.tipoMovimentacao);
    // Informando o valor da transação
    cy.getByData('form-input').type(informacoes.valorTransacao);
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
