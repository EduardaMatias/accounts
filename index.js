import inquirer from 'inquirer';
import chalk from 'chalk';

import fs from 'fs';

const menuOptions = [
  'Criar conta',
  'Consultar saldo',
  'Depositar',
  'Sacar',
  'Transferência bancária',
  'Fechar conta',
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
          getAccountBalance();
          break;
        case 'Depositar':
          deposit();
          break;
        case 'Sacar':
          withdraw();
          break;
        case 'Transferência bancária':
          transferFunds();
          break;
        case 'Fechar conta':
          closeAccount();
          break;
        case 'Sair':
          console.log(chalk.bgBlue.black('Obrigada por usar o Accounts!'));
          process.exit();
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

function getAccountBalance() {
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
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}`
        )
      );

      operation();
    })
    .catch((err) => console.log(err));
}

function withdraw() {
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
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];

          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível no momento!'));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque no valor de R$${amount} da sua conta!`)
  );

  operation();
}

function closeAccount() {
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
        return closeAccount();
      }

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'option',
            message: `Tem certeza que deseja fechar a conta ${accountName}?`,
            choices: ['Sim', 'Não'],
          },
        ])
        .then((answer) => {
          const option = answer['option'];
          switch (option) {
            case 'Não':
              operation();
              break;
            case 'Sim':
              removeAccount(accountName);
              break;
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAccount(accountName) {
  const accountData = getAccount(accountName);

  if (accountData.balance > 0) {
    console.log(
      chalk.bgRed.black(
        'Erro ao fechar: você precisa esvaziar a conta antes de fechá-la'
      )
    );

    return operation();
  }

  fs.unlink(`accounts/${accountName}.json`, function (err) {
    return console.log(err);
  });

  console.log(chalk.green(`A conta ${accountName} foi fechada com sucesso!`));

  operation();
}

function transferFunds() {
  inquirer
    .prompt([
      {
        name: 'accountOriginName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountOriginName = answer['accountOriginName'];

      if (!checkAccount(accountOriginName)) {
        return transferFunds();
      }

      inquirer
        .prompt([
          {
            name: 'destinationAccountName',
            message: 'Qual o nome da conta do destinatário?',
          },
        ])
        .then((answer) => {
          const destinationAccountName = answer['destinationAccountName'];

          if (!checkAccount(destinationAccountName)) {
            return transferFunds();
          }

          sendMoney(accountOriginName, destinationAccountName);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function sendMoney(origin, destination) {
  inquirer
    .prompt([
      {
        name: 'amount',
        message: `Qual valor você deseja transferir para a conta ${destination}?`,
      },
    ])
    .then((answer) => {
      const amount = answer['amount'];

      const accountOriginData = getAccount(origin);
      const accountDestionationData = getAccount(destination);

      if (!amount) {
        console.log(
          chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!')
        );
        return transferFunds();
      }

      if (accountOriginData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível no momento!'));
        return transferFunds();
      }

      accountOriginData.balance =
        parseFloat(accountOriginData.balance) - parseFloat(amount);
      accountDestionationData.balance =
        parseFloat(accountDestionationData.balance) + parseFloat(amount);

      fs.writeFileSync(
        `accounts/${origin}.json`,
        JSON.stringify(accountOriginData),
        function (err) {
          console.log(err);
        }
      );

      fs.writeFileSync(
        `accounts/${destination}.json`,
        JSON.stringify(accountDestionationData),
        function (err) {
          console.log(err);
        }
      );

      console.log(
        chalk.green(
          `Foi realizado uma transferência no valor de R$${amount} da sua conta ${origin} para a conta ${destination}!`
        )
      );

      operation();
    })
    .catch((err) => console.log(err));
}

//utils

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
