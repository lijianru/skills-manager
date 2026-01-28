import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface SkillConfig {
  source: string;
  installDate: string;
  links: {
    targetPath: string;
    sourceSubPath?: string;
  }[];
}

export interface AppConfig {
  skillsRoot: string;
  skills: Record<string, SkillConfig>;
}

const DEFAULT_CONFIG: AppConfig = {
  skillsRoot: path.join(os.homedir(), '.skills-manager', 'skills'),
  skills: {},
};

const CONFIG_DIR = path.join(os.homedir(), '.skills-manager');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (!fs.existsSync(CONFIG_FILE)) {
        // Ensure directory allows write before saving default
        fs.ensureDirSync(CONFIG_DIR);
        fs.writeJSONSync(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
        return DEFAULT_CONFIG;
      }
      return fs.readJSONSync(CONFIG_FILE) as AppConfig;
    } catch (error) {
      console.error('Failed to load config, using defaults:', error);
      return DEFAULT_CONFIG;
    }
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public saveConfig(newConfig: AppConfig): void {
    try {
      fs.ensureDirSync(CONFIG_DIR);
      fs.writeJSONSync(CONFIG_FILE, newConfig, { spaces: 2 });
      this.config = newConfig;
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  public updateSkill(name: string, skill: SkillConfig): void {
    this.config.skills[name] = skill;
    this.saveConfig(this.config);
  }

  public getSkill(name: string): SkillConfig | undefined {
    return this.config.skills[name];
  }

  public removeSkill(name: string): void {
    delete this.config.skills[name];
    this.saveConfig(this.config);
  }
}

export const configManager = new ConfigManager();
