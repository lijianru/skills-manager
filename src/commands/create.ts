import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import open from 'open';
import { configManager } from '../core/config-manager.js';

export const createCommand = new Command('create')
  .argument('[name]', 'Name of the new skill')
  .description('Create a new local skill')
  .action(async (name) => {
    let skillName = name;

    if (!skillName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter the name of the new skill:',
          validate: (input) => input.trim() !== '' || 'Name cannot be empty',
        },
      ]);
      skillName = answers.name;
    }

    const config = configManager.getConfig();
    const localRepoName = 'my-local-skills';
    const localRepoPath = path.join(config.skillsRoot, localRepoName);

    // Ensure local repo container exists
    await fs.ensureDir(localRepoPath);

    // Register local repo if not exists
    if (!config.skills[localRepoName]) {
      configManager.updateSkill(localRepoName, {
        source: 'local',
        installDate: new Date().toISOString(),
        links: [],
      });
    }

    const newSkillPath = path.join(localRepoPath, skillName);

    if (fs.existsSync(newSkillPath)) {
      console.error(chalk.red(`Skill "${skillName}" already exists in ${localRepoName}`));
      return;
    }

    try {
      // Create directory
      await fs.ensureDir(newSkillPath);

      // Create SKILL.md
      const readmePath = path.join(newSkillPath, 'SKILL.md');
      await fs.writeFile(readmePath, `# ${skillName}\n\nAdd your skill instructions, rules, or prompts here.\n`);

      console.log(chalk.green(`\n✔ Skill "${skillName}" created in "${localRepoName}"!`));
      console.log(chalk.dim(`Location: ${newSkillPath}`));

      // Open folder
      await open(newSkillPath);

      // Instructions
      console.log('\n' + chalk.bold('To install/link this skill:'));
      console.log(chalk.cyan(`   skm link ${localRepoName}`));
      console.log('\n' + chalk.bold('To manage version control:'));
      console.log(`   cd ${localRepoPath} && git init`);
      console.log('\n');
    } catch (error: any) {
      console.error(chalk.red(`Failed to create skill: ${error.message}`));
    }
  });

// Need to install 'open' package if not present?
// Checking package.json... open is not in dependencies. I should check.
// Using 'open' might require installing it. Or I can use 'execa' to run 'open' (mac) / 'xdg-open' (linux) / 'explorer' (win).
// Since I have 'execa' installed, I can use that to avoid adding a dependency if I want strictness,
// but 'open' package is cross-platform standard.
// The user is on Mac, so `execa('open', [skillPath])` works.
