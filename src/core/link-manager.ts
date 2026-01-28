import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { linker } from './linker.js';
import { configManager } from './config-manager.js';

export class LinkManager {
  /**
   * Interactively select and link skills from a repository
   */
  async linkInteractive(repoName: string): Promise<void> {
    const config = configManager.getConfig();
    const repoPath = path.join(config.skillsRoot, repoName);
    const skillConfig = config.skills[repoName];

    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository ${repoName} not found at ${repoPath}`);
    }

    // Discovery Logic
    // 1. Check for 'skills' directory
    // 2. Or assume root subdirectories are skills
    const skillsDir = path.join(repoPath, 'skills');
    let searchDir = repoPath;
    let prefix = '';

    if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
      searchDir = skillsDir;
      prefix = 'skills/'; // relative prefix for display/logic
    }

    // List subdirectories
    const items = await fs.readdir(searchDir);
    const candidates = items.filter((item) => {
      const fullPath = path.join(searchDir, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== '.git';
    });

    // Also add the root itself as an option if it's not the skills dir scenario
    // But for "awesome-skills" repos, usually we want sub items.
    // Let's stick to subdirectories for now as requested.

    if (candidates.length === 0) {
      console.log(chalk.yellow('No sub-skills found in this repository. Linking the entire repository instead.'));
      // Fallback to linking whole repo
      await this.linkItem(repoName, repoPath, '', repoName);
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedSkills',
        message: 'Select skills to link (Space to select, Enter to confirm):',
        choices: candidates,
        pageSize: 15,
      },
    ]);

    const { selectedSkills } = answers;

    if (selectedSkills.length === 0) {
      console.log('No skills selected.');
      return;
    }

    // IDE Selection
    const { targetIDE } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetIDE',
        message: 'Select target IDE:',
        choices: ['Cursor', 'Windsurf', 'Antigravity', 'Other (Custom)'],
        default: 0,
      },
    ]);

    let targetParentDir = '';

    if (targetIDE !== 'Other (Custom)') {
      const { installMode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'installMode',
          message: `How do you want to install for ${targetIDE}?`,
          choices: [
            { name: `Global Install (Auto-detect path)`, value: 'global' },
            { name: 'Custom Project Directory', value: 'custom' },
          ],
          default: 0,
        },
      ]);

      if (installMode === 'global') {
        const home = process.env.HOME || process.env.USERPROFILE || '';
        switch (targetIDE) {
          case 'Cursor':
            targetParentDir = path.join(home, '.cursor', 'skills');
            break;
          case 'Windsurf':
            targetParentDir = path.join(home, '.codeium', 'windsurf', 'skills');
            break;
          case 'Antigravity':
            targetParentDir = path.join(home, '.gemini', 'antigravity', 'skills');
            break;
        }
        console.log(chalk.blue(`Target (Global): ${targetParentDir}`));
      } else {
        // Custom Project Directory
        const res = await inquirer.prompt([
          {
            type: 'input',
            name: 'path',
            message: 'Enter absolute target project directory (e.g., /Users/username/my-project/):',
            default: process.cwd(),
          },
        ]);
        targetParentDir = path.resolve(res.path.trim());

        // Append IDE-specific local config path
        switch (targetIDE) {
          case 'Cursor':
            targetParentDir = path.join(targetParentDir, '.cursor', 'skills');
            break;
          case 'Windsurf':
            targetParentDir = path.join(targetParentDir, '.windsurf', 'skills');
            break;
          case 'Antigravity':
            targetParentDir = path.join(targetParentDir, '.agent', 'skills');
            break;
        }
        console.log(chalk.blue(`Target (Project): ${targetParentDir}`));
      }
    } else {
      const res = await inquirer.prompt([
        {
          type: 'input',
          name: 'path',
          message: 'Enter absolute target directory (e.g., /Users/username/my-project/):',
          default: process.cwd(),
        },
      ]);
      targetParentDir = path.resolve(res.path.trim());
    }

    // Confirm creation if global path doesn't exist
    if (!fs.existsSync(targetParentDir)) {
      const { createDir } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createDir',
          message: `Directory ${targetParentDir} does not exist. Create it?`,
          default: true,
        },
      ]);
      if (createDir) {
        await fs.ensureDir(targetParentDir);
      } else {
        console.log('Aborted.');
        return;
      }
    }

    for (const skillName of selectedSkills) {
      const sourceSubPath = prefix + skillName;
      const sourcePath = path.join(repoPath, sourceSubPath);
      await this.linkItem(repoName, sourcePath, sourceSubPath, skillName, targetParentDir);
    }
  }

  private async linkItem(repoName: string, sourcePath: string, sourceSubPath: string, linkName: string, targetParentDir?: string) {
    let targetDir = targetParentDir;
    if (!targetDir) {
      // prompt if not provided (fallback)
      const res = await inquirer.prompt([
        {
          type: 'input',
          name: 'target',
          message: `Where to link "${linkName}"?`,
          default: process.cwd(),
        },
      ]);
      targetDir = res.target;
    }

    const targetPath = path.join(targetDir!, linkName);
    const spinner = ora(`Linking ${linkName}...`).start();

    try {
      await linker.createLink(sourcePath, targetPath);
      spinner.succeed(`Linked ${linkName} -> ${targetPath}`);

      // Update config
      const currentConfig = configManager.getSkill(repoName);
      if (currentConfig) {
        const newLink = { targetPath, sourceSubPath };
        // Avoid duplicates
        const links = currentConfig.links || [];
        if (!links.some((l) => l.targetPath === targetPath)) {
          links.push(newLink);
          currentConfig.links = links;
          configManager.updateSkill(repoName, currentConfig);
        }
      }
    } catch (e: any) {
      spinner.fail(`Failed to link ${linkName}: ${e.message}`);
    }
  }
}

export const linkManager = new LinkManager();
