import { Command } from 'commander';
import { configManager } from '../core/config-manager.js';
import chalk from 'chalk';

export const configCommand = new Command('config').description('View current configuration').action(() => {
  const config = configManager.getConfig();
  console.log(chalk.blue('Skills Root:'), config.skillsRoot);
  console.log(chalk.blue('Installed Skills:'), Object.keys(config.skills).length);
  console.log(JSON.stringify(config, null, 2));
});
