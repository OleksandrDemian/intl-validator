import fs from 'fs-extra';
import path from 'path';
import { IntlValidatorConfig } from './types';

export async function readConfig(configPath: string = '.intl-validator.json'): Promise<IntlValidatorConfig> {
  try {
    // Get the absolute path for the config file
    const absoluteConfigPath = path.isAbsolute(configPath) 
      ? configPath 
      : path.resolve(process.cwd(), configPath);
    
    // Check if the config file exists
    if (!await fs.pathExists(absoluteConfigPath)) {
      throw new Error(`Config file not found at ${absoluteConfigPath}`);
    }
    
    // Read and parse the config file
    const configData = await fs.readJSON(absoluteConfigPath);
    
    // Validate that the required properties exist
    if (!configData.projectRoot) {
      throw new Error('Config file missing required "projectRoot" property');
    }
    
    if (!configData.exampleTranslationFile) {
      throw new Error('Config file missing required "exampleTranslationFile" property');
    }
    
    return {
      projectRoot: configData.projectRoot,
      exampleTranslationFile: configData.exampleTranslationFile
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read config file: ${error.message}`);
    }
    throw error;
  }
}