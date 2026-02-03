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

    // Check for installed copies/links
    const links = skill.links || [];
    const hasLinks = links.length > 0;

    const choices = [];
    if (hasLinks) {
      choices.push({ name: 'Select specific installed copies to delete', value: 'select_copies' });
    }
    choices.push({ name: 'Uninstall entire skill (Delete repo and ALL copies)', value: 'uninstall_all' });

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Manage "${name}":`,
        choices: choices,
      },
    ]);

    if (action === 'select_copies') {
      const { copiesToRemove } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'copiesToRemove',
          message: 'Select copies to remove:',
          choices: links.map((l) => ({ name: `${l.sourceSubPath ? '[' + l.sourceSubPath + '] ' : ''}${l.targetPath}`, value: l.targetPath })),
        },
      ]);

      if (copiesToRemove.length === 0) {
        console.log('No copies selected.');
        return;
      }

      for (const target of copiesToRemove) {
        try {
          console.log(`Removing: ${target}`);
          await linker.removeSkill(target);
        } catch (e: any) {
          console.error(chalk.yellow(`Error removing ${target}: ${e.message}`));
        }
      }

      // Update config
      skill.links = links.filter((l) => !copiesToRemove.includes(l.targetPath));
      configManager.updateSkill(name, skill);
      console.log(chalk.green(`Removed ${copiesToRemove.length} copies.`));
      return;
    }

    // Fallthrough to uninstall_all

    // Confirm
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to completely remove "${name}"?`,
        default: false,
      },
    ]);

    if (!confirm) return;

    // Remove remaining links
    if (skill.links) {
      for (const link of skill.links) {
        try {
          console.log(`Removing installed copy: ${link.targetPath}`);
          await linker.removeSkill(link.targetPath);
        } catch (e: any) {
          console.error(chalk.yellow(`Failed to remove link ${link.targetPath}: ${e.message}`));
        }
      }
    }

    // Remove source repo
    const repoPath = path.join(configManager.getConfig().skillsRoot, name);
    if (fs.existsSync(repoPath)) {
      console.log(`Removing repository: ${repoPath}`);
      await fs.remove(repoPath);
    }

    // Update config
    configManager.removeSkill(name);
    console.log(chalk.green(`Skill "${name}" removed.`));
  });
