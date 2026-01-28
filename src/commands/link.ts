import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config-manager.js';
import { linkManager } from '../core/link-manager.js';

export const linkCommand = new Command('link')
  .argument('[name]', 'Name of the repository to link from')
  .description('Link specific skills from an installed repository')
  .action(async (name) => {
    let repoName = name;

    const skills = configManager.getConfig().skills;
    const installedRepos = Object.keys(skills);

    if (installedRepos.length === 0) {
      console.log(chalk.yellow('No repositories installed. Use "install" first.'));
      return;
    }

    if (!repoName) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'repo',
          message: 'Select a repository to link skills from:',
          choices: installedRepos,
        },
      ]);
      repoName = answers.repo;
    } else if (!skills[repoName]) {
      console.error(chalk.red(`Repository "${repoName}" is not installed.`));
      return;
    }

    await linkManager.linkInteractive(repoName);
  });
