import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { gitService } from '../core/git-service.js';
import { configManager } from '../core/config-manager.js';
import { linker } from '../core/linker.js';
import { linkManager } from '../core/link-manager.js';

export const installCommand = new Command('install')
  .alias('i')
  .argument('<url>', 'Git repository URL of the skill')
  .argument('[name]', 'Name of the skill (defaults to repo name)')
  .description('Install a new skill from a git repository')
  .action(async (url, name) => {
    try {
      const repoName = name || gitService.getRepoName(url);
      const existing = configManager.getSkill(repoName);

      if (existing) {
        console.log(chalk.yellow(`Skill "${repoName}" is already installed.`));
        console.log(`Use 'skills-manager update ${repoName}' to update it.`);
        return;
      }

      const skillsRoot = configManager.getConfig().skillsRoot;
      const installPath = path.join(skillsRoot, repoName);

      const spinner = ora(`Cloning ${url} to ${installPath}...`).start();
      try {
        await gitService.clone(url, installPath);
        spinner.succeed(`Cloned ${repoName}`);
      } catch (e: any) {
        spinner.fail(`Failed to clone: ${e.message}`);
        return; // Exit if clone fails
      }

      // Initial registration
      configManager.updateSkill(repoName, {
        source: url,
        installDate: new Date().toISOString(),
        links: [],
      });

      console.log(chalk.green(`\nRepository "${repoName}" downloaded.`));

      // Ask user if they want to link
      const { shouldLink } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldLink',
          message: 'Do you want to select and link skills now?',
          default: true,
        },
      ]);

      if (shouldLink) {
        // Use the shared link manager
        // We need to dynamically import or just use the imported one (circular dep caution?)
        // It's fine here passed as dependency or imported
        // const { linkManager } = await import('../core/link-manager.js'); // Already imported
        await linkManager.linkInteractive(repoName);
      }
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message);
    }
  });
