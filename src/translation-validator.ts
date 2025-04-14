import fs from 'fs-extra';
import path from 'path';
import { TranslationMap, ValidationResult } from './types';

/**
 * Validates translation keys against the translation file
 */
export class TranslationValidator {
  private translationData: TranslationMap = {};

  /**
   * Loads the translation file
   */
  public async loadTranslationFile(translationFilePath: string): Promise<void> {
    try {
      const absolutePath = path.isAbsolute(translationFilePath)
        ? translationFilePath
        : path.resolve(process.cwd(), translationFilePath);
      
      if (!await fs.pathExists(absolutePath)) {
        throw new Error(`Translation file not found: ${absolutePath}`);
      }
      
      this.translationData = await fs.readJSON(absolutePath);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error loading translation file: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validates a set of translation keys against the loaded translation file
   */
  public validateTranslationKeys(translationKeys: string[]): ValidationResult {
    const result: ValidationResult = {
      missingTranslations: [],
      validTranslations: []
    };
    
    // Process each translation key
    for (const key of translationKeys) {
      if (this.translationKeyExists(key)) {
        result.validTranslations.push(key);
      } else {
        result.missingTranslations.push(key);
      }
    }
    
    return result;
  }

  /**
   * Checks if a translation key exists in the translation file
   */
  private translationKeyExists(key: string): boolean {
    // Split the key into its parts
    const parts = key.split('.');
    
    // Navigate the translation data object
    let current: any = this.translationData;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object' || !current[part]) {
        return false;
      }
      current = current[part];
    }
    
    return true;
  }
}