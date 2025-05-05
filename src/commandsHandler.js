import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';

export async function handleCommand(command, currentDir, updateDir) {
  const [cmd, ...args] = command.split(' ');

  switch (cmd) {
    case 'up': {
      const parentDir = path.dirname(currentDir);
      if (parentDir !== currentDir) {
        updateDir(parentDir);
        await listDirectory(parentDir);
      }
      break;
    }

    case 'cd': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }
      const targetPath = path.resolve(currentDir, args[0]);
      try {
        const stat = await fs.stat(targetPath);
        if (stat.isDirectory()) {
          updateDir(targetPath);
        } else {
          console.log('Invalid input');
        }
      } catch {
        console.log('Operation failed');
      }
      break;
    }

    case 'ls':{
      await listDirectory(currentDir);
      break;
    }
      
    case 'cat': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }
      const filePath = path.resolve(currentDir, args[0]);
      try {
        const stream = createReadStream(filePath, 'utf8');
        stream.pipe(process.stdout);
        stream.on('end', () => console.log());
        stream.on('error', () => console.log('Operation failed'));
      } catch {
        console.log('Operation failed');
      }
      break;
    }
    case 'add': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }
      const filePath = path.resolve(currentDir, args[0]);
      try {
        await fs.writeFile(filePath, '');
      } catch {
        console.log('Operation failed');
      }
      break;
    }

    case 'rn': {
      if (args.length < 2) {
        console.log('Invalid input');
        return;
      }
      const oldPath = path.resolve(currentDir, args[0]);
      const newPath = path.resolve(currentDir, args[1]);
      try {
        await fs.rename(oldPath, newPath);
      } catch {
        console.log('Operation failed');
      }
      break;
    }


    default:
      console.log('Invalid input');
  }
}


async function listDirectory(dir) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const folders = items.filter(item => item.isDirectory()).map(item => item.name).sort();
    const files = items.filter(item => item.isFile()).map(item => item.name).sort();
    const sorted = [...folders, ...files];
    sorted.forEach(name => {
      const type = folders.includes(name) ? 'directory' : 'file';
      console.log(`${name}\t(${type})`);
    });
  } catch {
    console.log('Operation failed');
  }
}
