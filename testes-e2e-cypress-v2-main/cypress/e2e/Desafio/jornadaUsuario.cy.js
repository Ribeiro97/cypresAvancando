describe('Jornadas de usuário', () => {
  beforeEach(() => {
    // interceptando as API'S
    cy.intercept('PUT', '**/users/**/saldo').as('putUsers');
    cy.intercept('GET', '**/users/**/saldo').as('getUsers');
    cy.intercept('POST', '**/users/**/transations').as('postTransations');
    
  });
  
  
  it('Deve permitir que a pessoa usuária acesse a aplicação, realize uma transação e faça um logout', () => {
    // Variável para armazenar o usuário
    var usuario;
    
    // Acessando a página inicial do site
    cy.visit('/');

    // Pegando o primeiro usuário da base de dados mais atualizado
    cy.primeiroUsuario().then((user) => {
        usuario = user;
        // Realizando login com o usuário
        cy.login(usuario.email, usuario.senha);
        cy.log(`Teste 1º: ${usuario}`);
    });
    

    cy.log(`Teste 2 º: ${usuario}`);
    
    
    
    // Verificando se a pessoa usuária foi redirecionada para a página home
    cy.location('pathname').should('eq', '/home');
    
    // Seleciona Transferencia no select de opções
    cy.getByData('select-opcoes').select('Transferência');

    cy.getByData('form-input').type('85');
    cy.getByData('realiza-transacao').click();

    // Verificando se a transação foi realizada com sucesso
    cy.log(`👌👌👌👌👌👌👌👌👌👌👌`);
    cy.wait('@putUsers').then((interception) => {
      interception.response = {
        statusCode: 200,
        body: {
          nome: usuario.nome,
          email: usuario.email,
        }
      };
    })

    cy.wait('@postTransations').its('response.statusCode').should('eq', 200);
    //cy.wait('@getUsers').its('response.statusCode').should('eq', 200);


    cy.getByData('lista-transacoes').find('li').last().contains('- R$ 85');
    cy.getByData('botao-sair').click();
    cy.location('pathname').should('eq', '/');
  });
});
