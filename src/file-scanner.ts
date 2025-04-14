import glob from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';

/**
 * Finds all .tsx files in the specified project root
 */
export async function findTsxFiles(projectRoot: string): Promise<string[]> {
  try {
    // Convert to absolute path if not already
    const absolutePath = path.isAbsolute(projectRoot) 
      ? projectRoot 
      : path.resolve(process.cwd(), projectRoot);
    
    // Validate that the directory exists
    if (!await fs.pathExists(absolutePath)) {
      throw new Error(`Project root directory not found: ${absolutePath}`);
    }
    
    // Use fast-glob to find all TSX files
    const pattern = `${absolutePath}/**/*.tsx`;
    const files = await glob(pattern, { onlyFiles: true });
    
    console.log(`Found ${files.length} .tsx files in ${absolutePath}`);
    return files;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error scanning for .tsx files: ${error.message}`);
    }
    throw error;
  }
}