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

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: menuOptions,
      },
    ])
    .then((answer) => {
      const action = answer['action'];

      switch (action) {
        case 'Criar conta':
          createAccount();
          break;
        case 'Consultar saldo':
          console.log('Consultar saldo');
          break;
        case 'Depositar':
          deposit();
          break;
        case 'Sacar':
          console.log('Sacar');
          break;
        case 'Sair':
          console.log(chalk.bgBlue.black('Obrigada por usar o Accounts!'));
          process.exit();
          break;
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir'));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];
      console.info(accountName);

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts');
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!')
        );

        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green('Parabéns, sua conta foi criada!'));

      operation();
    })
    .catch((err) => console.log(err));
}

function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];

          addAmount(accountName, amount);

          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
    );
    return;
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`)
  );
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black('Esta conta não existe, escolha outro nome!')
    );
    return false;
  }

  return true;
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf8',
    flag: 'r',
  });

  return JSON.parse(accountJSON);
}
