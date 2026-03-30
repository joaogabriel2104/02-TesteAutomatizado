import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://joaogabriel2104.github.io/02-TesteAutomatizado/');
    await expect(page).toHaveTitle(/QS Acadêmico/);
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await expect(page.locator('#secao-cadastro')).toBeVisible();
      await expect(page.getByLabel('Nome do Aluno')).toHaveAttribute(
        'placeholder', 'Digite o nome completo'
      );

      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos tbody').getByText('João Silva')).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
       await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();

      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // ============ GRUPO 3: Validação de Notas ============

  test.describe('Validação de Notas', () => {
    test('não deve aceitar notas fora de invervalo 0-10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Gabriel');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('11');
      await page.getByLabel('Nota 3').fill('-1');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    })
  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
      // Cadastra dois alunos
      await page.getByLabel('Nome do Aluno').fill('João Gabriel');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Ulisses Cardoso');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Filtra pelo primeiro aluno
      await page.locator('#busca').fill('João');

      await expect(page.getByText('João Gabriel')).toBeVisible();
      await expect(page.getByText('Ulisses Cardoso')).not.toBeVisible();
    });
  });

  // ========== GRUPO 5: Exclusão ==========

  test.describe('Exclusão de Aluno', () => {
    test('deve remover o aluno e deixar a tabela vazia', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Gabriel');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      await page.locator('#tabela-alunos tbody tr').first().getByRole('button', { name: 'Excluir' }).click();

      await expect(page.getByText('João Gabriel')).not.toBeVisible();
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve contabilizar corretamente aprovados, recuperação e reprovados', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ulisses');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Matheus');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('João Gabriel');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

       await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);

      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#stat-aprovados')).toHaveText('1');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

  });


  // ========== GRUPO 7: Situação do Aluno ==========

  test.describe('Situação do Aluno', () => {

    test('deve exibir "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

    test('deve exibir "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('4');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

    test('deve exibir "Recuperação" para média >= 5 e < 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperação');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Recuperação');
    });

  });

  // ========== GRUPO 8: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve exibir 3 linhas após cadastrar 3 alunos', async ({ page }) => {
      const alunos = [
        { nome: 'Aluno Um', n1: '8', n2: '7', n3: '9' },
        { nome: 'Aluno Dois', n1: '5', n2: '6', n3: '4' },
        { nome: 'Aluno Três', n1: '3', n2: '2', n3: '4' },
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

  // ========== GRUPO 9: Limpar Tudo ==========

  test.describe('Limpar Tudo', () => {

    test('deve limpar todos os alunos ao confirmar o diálogo', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Teste');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      // Aceitar o diálogo de confirmação
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

  });
});