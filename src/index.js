import readline from 'readline';

const username = process.argv
  .find((arg) => arg.startsWith('--username='))
  ?.split('=')[1];

if (!username) {
  console.error('Username is required! Please run the script with --username=YourName');
  process.exit(1);
}

console.log(`Welcome to the File Manager, ${username}!`);

let currentDir = process.cwd();

function printCurrentDirectory() {
  console.log(`You are currently in ${currentDir}`);
}

printCurrentDirectory();

const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('> ');
rl.prompt();

rl.on('line', async (input) => {
  const command = input.trim();
  
  if (command === '.exit') {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
  }

  console.log(`Received command: ${command}`);
  
  printCurrentDirectory();
  rl.prompt();
});

rl.on('SIGINT', () => {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  process.exit();
});

