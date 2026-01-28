import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json to get version
// In ESM dist structure, package.json might be one level up from dist, so ../package.json
// But src is compiled to dist, so relative path from dist/index.js to package.json is ../package.json
const packageJsonParams = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

import { configCommand } from './commands/config.js';
import { installCommand } from './commands/install.js';
import { linkCommand } from './commands/link.js';
import { listCommand } from './commands/list.js';
import { removeCommand } from './commands/remove.js';
import { updateCommand } from './commands/update.js';

const program = new Command();

program.name('skills-manager').description('CLI to manage coding assistant skills').version(packageJsonParams.version);

program.addCommand(configCommand);
program.addCommand(installCommand);
program.addCommand(linkCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);
program.addCommand(updateCommand);

program.parse(process.argv);
