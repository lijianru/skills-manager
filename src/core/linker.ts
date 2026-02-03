import fs from 'fs-extra';
import path from 'path';

export class Linker {
  /**
   * Creates a symbolic link.
   * @param source The actual file/folder to point to.
   * @param target The location where the link will be created.
   */
  /**
   * Copies the skill source to the target location.
   * @param source The actual file/folder to copy from.
   * @param target The location where the skill will be installed.
   */
  async copySkill(source: string, target: string): Promise<void> {
    const parentDir = path.dirname(target);
    await fs.ensureDir(parentDir);

    // Overwrite existing content
    await fs.copy(source, target, { overwrite: true });
  }

  async removeSkill(target: string): Promise<void> {
    // Safely remove the target directory/file
    try {
      if (fs.existsSync(target)) {
        await fs.remove(target);
      }
    } catch (e: any) {
      console.error(`Failed to remove ${target}: ${e.message}`);
    }
  }
}

export const linker = new Linker();
