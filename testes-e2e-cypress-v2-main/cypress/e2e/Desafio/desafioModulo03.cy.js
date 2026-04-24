// Você precisa escrever um teste para verificar se as informações como:
//  - nome,
//  - senha,
//  - email,
//      > as transações e o saldo desse usuário aparecem na interface do usuário de forma correta.

describe('Testando informações do usuário', () => {
  let users;
 

  beforeEach(() => {
    cy.request('GET', 'http://localhost:8000/users').then((response) => {
      users = response.body;
    });

    cy.intercept('GET', '**/transacoes').as('getTransacoes');
    cy.intercept('GET', '**/saldo').as('getSaldo');
  });

  it('Deve exibir as informações do usuário corretamente', () => {
    cy.wrap(users).each((user) => {
      // Realizando login
      cy.login(user.email, user.senha);

      // Acessando a página home
      cy.visit('/home');

      // Validando nome do usuário no cabeçalho
      cy.get('Header').within(() => {
        cy.get('p').should('contain', user.nome);
      });

      //Validando Saldo
      cy.get('[data-testid="saldo"]').should('contain', `R$ ${user.saldo}`);


      if (user.transacoes.length > 0 ){
      // Validando transações
      cy.getByData('lista-transacoes')
        .should('exist')
        .find('li')
        .then((transacoesLista) => {
          if (transacoesLista.length > 0) {
            cy.request({
              method: 'GET',
              url: `http://localhost:8000/users/${user.id}/`,
              failOnStatusCode: false,
            }).then((transacoesApi) => {
                // transformando a resposta da api em um array
                const transacoes = transacoesApi.body.transacoes || [];
                // Passando por cada transação da api e validando se as informações estão corretas na interface do usuário
                transacoes.forEach((transacaoApi, index) => {
                  const $transacao = Cypress.$(transacoesLista[index]);

                  expect($transacao.text()).to.include(transacaoApi.tipoTransacao);
                  expect($transacao.text()).to.include(transacaoApi.valor);
                  expect($transacao.text()).to.include(transacaoApi.mes);
                });
            });
          }
        });
    }

      cy.getByData('botao-sair').click();
    });
  });
});
