import { Command } from 'commander';
import { configManager } from '../core/config-manager.js';
import chalk from 'chalk';

export const listCommand = new Command('list')
  .alias('ls')
  .description('List installed skills')
  .action(() => {
    const config = configManager.getConfig();
    const skills = config.skills;
    const skillNames = Object.keys(skills);

    if (skillNames.length === 0) {
      console.log('No skills installed.');
      return;
    }

    console.log(chalk.bold.underline('Installed Skills:'));
    skillNames.forEach((name) => {
      const skill = skills[name];
      console.log(`\n${chalk.cyan(name)}`);
      console.log(`  Source: ${skill.source}`);
      console.log(`  Installed: ${new Date(skill.installDate).toLocaleString()}`);
      if (skill.links && skill.links.length > 0) {
        console.log(`  Links:`);
        skill.links.forEach((link) => {
          console.log(`    - ${link.targetPath}`);
        });
      } else {
        console.log(`  Links: (none)`);
      }
    });
  });
