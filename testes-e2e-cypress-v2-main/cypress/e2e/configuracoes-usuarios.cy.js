import { faker } from '@faker-js/faker';

describe('Atualização de dados do Usuario', () => {
  const novoDadosDeUsuario = {
    nome: faker.name.fullName(),
    senha: faker.internet.password(),
  };

  it('Deve permitir o usuário a atualizar seus dados', () => {
    cy.request('GET', 'http://localhost:8000/users').then((response) => {
      const usuario = response.body;
      cy.log(`Login: ${usuario[0].nome} - Senha: ${usuario[0].senha}`);

      // Login do usuário
      cy.login(usuario[0].email, usuario[0].senha);
      // Acessar a página home
      cy.visit('/home');
      cy.url().should('include', '/home');

      // Verificar se o nome do usuário está visível
      cy.contains(usuario[0].nome).should('be.visible');

      cy.getByData('app-home').find('a').eq(1).click();

      cy.url().should('include', '/minha-conta');

      cy.getByData('botao-salvar-alteracoes').should('be.disabled');

      cy.get('[name="nome"]').type(novoDadosDeUsuario.nome);
      cy.get('[name="senha"]').type(novoDadosDeUsuario.senha);

      cy.getByData('botao-salvar-alteracoes').should('not.be.disabled');
      cy.getByData('botao-salvar-alteracoes').click();

      cy.on('window:alert', (textoAlert) => {
        expect(textoAlert).to.equal('Alterações salvas com sucesso!');
      });

      cy.url().should('include', '/home');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('nomeUsuario')).to.equal(novoDadosDeUsuario.nome);
        const userId = win.localStorage.getItem('userId');

        cy.request('GET', `http://localhost:8000/users/${userId}`).then(
          (response) => {
            expect(response.status).to.equal(200);
            expect(response.body.nome).to.equal(novoDadosDeUsuario.nome);
          }
        );
      });
    });
  });
});
