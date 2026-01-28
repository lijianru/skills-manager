import fs from 'fs-extra';
import path from 'path';

export class Linker {
  /**
   * Creates a symbolic link.
   * @param source The actual file/folder to point to.
   * @param target The location where the link will be created.
   */
  async createLink(source: string, target: string): Promise<void> {
    const parentDir = path.dirname(target);
    await fs.ensureDir(parentDir);

    if (fs.existsSync(target)) {
      throw new Error(`Target path ${target} already exists.`);
    }

    // creates a symlink at `target` pointing to `source`
    await fs.ensureSymlink(source, target);
  }

  async removeLink(target: string): Promise<void> {
    // Check if path exists (lstat does not follow link)
    try {
      const stats = await fs.lstat(target);
      if (stats.isSymbolicLink()) {
        await fs.unlink(target);
      } else {
        // It exists but not a link?
        // We should be careful.
        throw new Error(`${target} exists but is not a symbolic link. Aborting removal to be safe.`);
      }
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        // Doesn't exist, easier job
        return;
      }
      throw e;
    }
  }
}

export const linker = new Linker();
