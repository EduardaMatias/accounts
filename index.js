import inquirer from 'inquirer';
import chalk from 'chalk';

import fs from 'fs';

const menuOptions = [
  'Criar conta',
  'Consultar saldo',
  'Depositar',
  'Sacar',
  'Sair',
];

(function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: menuOptions,
      },
    ])
    .then(() => {})
    .catch((err) => console.log(err));
})();

console.log('ok');
