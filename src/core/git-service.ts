import { execa } from 'execa';
import fs from 'fs-extra';

export class GitService {
  async clone(url: string, destination: string): Promise<void> {
    if (fs.existsSync(destination)) {
      throw new Error(`Destination ${destination} already exists.`);
    }
    // stdio: 'inherit' lets the user see git progress
    await execa('git', ['clone', url, destination], { stdio: 'inherit' });
  }

  async pull(path: string): Promise<void> {
    await execa('git', ['pull'], { cwd: path, stdio: 'inherit' });
  }

  /**
   * extracting repo name from url
   * e.g. https://github.com/owner/repo.git -> repo
   */
  getRepoName(url: string): string {
    const parts = url.split('/');
    let name = parts[parts.length - 1];
    if (name.endsWith('.git')) {
      name = name.slice(0, -4);
    }
    return name;
  }
}

export const gitService = new GitService();
