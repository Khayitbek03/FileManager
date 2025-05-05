import path from 'node:path';
import fs from 'node:fs/promises';
import {createReadStream, createWriteStream} from 'node:fs';
import os from 'node:os';

export async function handleCommand(command, currentDir, updateDir) {
  const [cmd, ...args] = command.trim().split(/\s+/);

  switch (cmd) {
    case 'up': {
      const parentDir = path.dirname(currentDir);
      if (parentDir !== currentDir) {
        updateDir(parentDir);
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
    case 'mkdir': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }
      const dirPath=path.resolve(currentDir, args[0]);
      try {
        await fs.mkdir(dirPath);
      } catch {
        console.log('Operation failed');
      }
      break;
    }
    case 'cp': {
      if (args.length < 2) {
        console.log('Invalid input');
        return;
      }
      const srcPath = path.resolve(currentDir, args[0]);
      const destPath = path.resolve(currentDir, args[1], path.basename(srcPath));
      try {
        await fs.access(srcPath);
        const readStream = createReadStream(srcPath);
        const writeStream = createWriteStream(destPath);
        readStream.pipe(writeStream);
        readStream.on('error', () => console.log('Operation failed'));
        writeStream.on('error', () => console.log('Operation failed'));
      } catch {
        console.log('Operation failed');
      }
      break;
    }

    case 'mv': {
      if (args.length < 2) {
        console.log('Invalid input');
        return;
      }
      const srcPath = path.resolve(currentDir, args[0]);
      const destPath = path.resolve(currentDir, args[1], path.basename(srcPath));
      try {
        await fs.access(srcPath);
        const readStream = createReadStream(srcPath);
        const writeStream = createWriteStream(destPath);
        readStream.pipe(writeStream);
        readStream.on('end', async () => {
          await fs.unlink(srcPath);
        });
        readStream.on('error', () => console.log('Operation failed'));
        writeStream.on('error', () => console.log('Operation failed'));
      } catch {
        console.log('Operation failed');
      }
      break;
    }

    case 'rm': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }
      const filePath = path.resolve(currentDir, args[0]);
      try {
        await fs.unlink(filePath);
      } catch {
        console.log('Operation failed');
      }
      break;
    }
      
    case 'os': {
      if (!args[0]) {
        console.log('Invalid input');
        return;
      }

      switch (args[0]) {
        case '--EOL':
          console.log(JSON.stringify(os.EOL));
          break;

        case '--cpus': {
          const cpus=os.cpus();
          console.log(`Overall CPUs: ${cpus.length}`);
          cpus.forEach((cpu, index) => {
            console.log(`CPU ${index+1}: ${cpu.model}, ${cpu.speed/1000} GHz`);
          });
          break;
        }

        case '--homedir':
          console.log(os.homedir());
          break;

        case '--username':
          console.log(os.userInfo().username);
          break;

        case '--architecture':
          console.log(os.arch());
          break;

        default:
          console.log('Invalid input');
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
