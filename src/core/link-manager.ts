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

    // Prepare list of items to link (name -> sourceSubPath)
    let itemsToLink: { name: string; subPath: string }[] = [];

    if (candidates.length === 0) {
      console.log(chalk.yellow('No sub-skills found in this repository. Linking the entire repository.'));
      // Link the root
      itemsToLink.push({ name: repoName, subPath: '' });
    } else {
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

      itemsToLink = selectedSkills.map((s: string) => ({
        name: s,
        subPath: prefix + s,
      }));
    }

    // IDE Selection (Common for both flows)
    const { targetIDE } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetIDE',
        message: 'Select target IDE:',
        choices: ['Cursor', 'Windsurf', 'Antigravity', 'Open Code', 'Claude', 'GitHub Copilot', 'Kiro', 'Codex', 'Other (Custom)'],
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
          case 'Open Code':
            targetParentDir = path.join(home, '.config', 'opencode', 'skills');
            break;
          case 'Claude':
            targetParentDir = path.join(home, '.claude', 'skills');
            break;
          case 'GitHub Copilot':
            targetParentDir = path.join(home, '.copilot', 'skills');
            break;
          case 'Kiro':
            targetParentDir = path.join(home, '.kiro', 'skills');
            break;
          case 'Codex':
            targetParentDir = path.join(home, '.codex', 'skills');
            break;
        }
        console.log(chalk.blue(`Target (Global): ${targetParentDir}`));
      } else {
        // Custom Project Directory
        const res = await inquirer.prompt([
          {
            type: 'input',
            name: 'path',
            message: 'Enter target project directory (Press Enter for current):',
          },
        ]);
        const inputPath = res.path.trim();
        targetParentDir = inputPath ? path.resolve(inputPath) : process.cwd();

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
          case 'Open Code':
            targetParentDir = path.join(targetParentDir, '.opencode', 'skills');
            break;
          case 'Claude':
            targetParentDir = path.join(targetParentDir, '.claude', 'skills');
            break;
          case 'GitHub Copilot':
            targetParentDir = path.join(targetParentDir, '.github', 'skills');
            break;
          case 'Kiro':
            targetParentDir = path.join(targetParentDir, '.kiro', 'skills');
            break;
          case 'Codex':
            targetParentDir = path.join(targetParentDir, '.codex', 'skills');
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

    // Perform Links / Copies
    for (const item of itemsToLink) {
      const sourcePath = path.join(repoPath, item.subPath);
      // Link name: if root (subPath empty), use repoName. Else use subdir name.
      const linkName = item.name;
      await this.linkItem(repoName, sourcePath, item.subPath, linkName, targetParentDir);
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
    const spinner = ora(`Installing ${linkName}...`).start();

    try {
      await linker.copySkill(sourcePath, targetPath);
      spinner.succeed(`Installed ${linkName} -> ${targetPath}`);

      // Update config
      const currentConfig = configManager.getSkill(repoName);
      if (currentConfig) {
        const newLink = { targetPath, sourceSubPath };
        // Avoid duplicates
        const links = currentConfig.links || [];
        // Check if targetPath already exists in links
        const existingIdx = links.findIndex((l) => l.targetPath === targetPath);
        if (existingIdx === -1) {
          links.push(newLink);
        } else {
          // Update existing entry if needed? Usually just skip add
          links[existingIdx] = newLink;
        }
        currentConfig.links = links;
        configManager.updateSkill(repoName, currentConfig);
      }
    } catch (e: any) {
      spinner.fail(`Failed to install ${linkName}: ${e.message}`);
    }
  }
}

export const linkManager = new LinkManager();
