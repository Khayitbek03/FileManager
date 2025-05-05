import readline from 'readline';
import os from 'os';
import { handleCommand } from './commandsHandler.js';

const username = process.argv
  .find((arg) => arg.startsWith('--username='))
  ?.split('=')[1];

if (!username) {
  console.error('Username is required! Please run the script with --username=YourName');
  process.exit(1);
}

console.log(`Welcome to the File Manager, ${username}!`);

let currentDir = os.homedir();

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

  try {
    await handleCommand(command, currentDir, (newDir) => {
      currentDir = newDir;
    });
  } catch (err) {
    console.log('Operation failed');
  }

  printCurrentDirectory();
  rl.prompt();
});

rl.on('SIGINT', () => {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  process.exit();
});
