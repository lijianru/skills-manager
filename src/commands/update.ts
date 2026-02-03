import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
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
    const config = configManager.getSkill(name);
    // Skip git pull if source is local or no .git directory
    if (config?.source === 'local' || !fs.existsSync(path.join(skillPath, '.git'))) {
      spinner.info(`Skipped git update for local skill "${name}"`);
    } else {
      await gitService.pull(skillPath);
      spinner.succeed(`Updated repository for ${name}`);
    }

    // Re-sync installed copies
    const skillConfig = configManager.getSkill(name);
    if (skillConfig && skillConfig.links && skillConfig.links.length > 0) {
      for (const link of skillConfig.links) {
        const sourceSubPath = link.sourceSubPath || '';
        const sourcePath = path.join(skillPath, sourceSubPath);
        spinner.start(`Syncing ${link.targetPath}...`);
        // Use linker to copy (overwrite is enabled in linker)
        // Avoid circular dependency if we import linker?
        // We can import it dynamically or just import at top level if no cycle.
        // link-manager uses linker, update uses linker. Safe.
        const { linker } = await import('../core/linker.js');
        await linker.copySkill(sourcePath, link.targetPath);
        spinner.succeed(`Synced: ${link.targetPath}`);
      }
    }
  } catch (e: any) {
    spinner.fail(`Failed to update ${name}: ${e.message}`);
  }
}
