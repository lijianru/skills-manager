import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { configManager } from '../core/config-manager.js';
import { linker } from '../core/linker.js';

export const removeCommand = new Command('remove')
  .alias('rm')
  .alias('uninstall')
  .argument('<name>', 'Name of the skill to remove')
  .description('Remove an installed skill')
  .action(async (name) => {
    const skill = configManager.getSkill(name);
    if (!skill) {
      console.error(chalk.red(`Skill "${name}" not found.`));
      return;
    }

    // Confirm
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove "${name}"? This will delete the cloned repo and remove recorded symlinks.`,
        default: false,
      },
    ]);

    if (!confirm) return;

    // Remove links
    if (skill.links) {
      for (const link of skill.links) {
        try {
          console.log(`Removing link: ${link.targetPath}`);
          await linker.removeLink(link.targetPath);
        } catch (e: any) {
          console.error(chalk.yellow(`Failed to remove link ${link.targetPath}: ${e.message}`));
        }
      }
    }

    // Remove cloned repo
    const repoPath = path.join(configManager.getConfig().skillsRoot, name);
    if (fs.existsSync(repoPath)) {
      console.log(`Removing repository: ${repoPath}`);
      await fs.remove(repoPath);
    }

    // Update config
    configManager.removeSkill(name);
    console.log(chalk.green(`Skill "${name}" removed.`));
  });
