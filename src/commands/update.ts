import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import ora from 'ora';
import { gitService } from '../core/git-service.js';
import { configManager } from '../core/config-manager.js';

export const updateCommand = new Command('update')
  .argument('[name]', 'Name of the skill to update')
  .description('Update installed skills (git pull)')
  .action(async (name) => {
    const skillsRoot = configManager.getConfig().skillsRoot;
    const skills = configManager.getConfig().skills;

    if (name) {
      // Update single skill
      if (!skills[name]) {
        console.error(chalk.red(`Skill "${name}" not found.`));
        return;
      }
      await updateSkill(name, skillsRoot);
    } else {
      // Update all
      const names = Object.keys(skills);
      if (names.length === 0) {
        console.log('No skills to update.');
        return;
      }
      console.log(chalk.blue(`Updating ${names.length} skills...`));
      for (const skillName of names) {
        await updateSkill(skillName, skillsRoot);
      }
    }
  });

async function updateSkill(name: string, root: string) {
  const skillPath = path.join(root, name);
  const spinner = ora(`Updating ${name}...`).start();
  try {
    await gitService.pull(skillPath);
    spinner.succeed(`Updated ${name}`);
  } catch (e: any) {
    spinner.fail(`Failed to update ${name}: ${e.message}`);
  }
}
