#!/usr/bin/env node

import { readConfig } from './config';
import { findTsxFiles } from './file-scanner';
import { TranslationAnalyzer } from './translation-analyzer';
import { TranslationValidator } from './translation-validator';
import path from 'path';
import { ValidationResult } from './types';

async function main() {
  try {
    console.log('🔍 intl-validator: Starting translation validation');
    
    // 1. Read the configuration file
    const config = await readConfig();
    console.log(`📁 Project root: ${config.projectRoot}`);
    console.log(`🌐 Translation file: ${config.translationFile}`);
    
    // 2. Find all .tsx files in the project
    const files = await findTsxFiles(config.projectRoot);
    
    // 3. Initialize the translation analyzer
    const analyzer = new TranslationAnalyzer();
    
    // 4. Initialize the translation validator
    const validator = new TranslationValidator();
    await validator.loadTranslationFile(config.translationFile);
    
    // 5. Process all files and collect translation keys
    console.log('🔍 Analyzing files for translation keys...');
    const allTranslationKeys: string[] = [];
    
    for (const file of files) {
      const keys = analyzer.analyzeFile(file);
      if (keys.length > 0) {
        console.log(`  📄 ${path.relative(process.cwd(), file)}: Found ${keys.length} translation keys`);
        allTranslationKeys.push(...keys);
      }
    }
    
    console.log(`\n🔑 Found ${allTranslationKeys.length} total translation keys`);
    
    // 6. Validate the translation keys
    console.log('\n🧪 Validating translation keys...');
    const uniqueKeys = [...new Set(allTranslationKeys)];
    const validationResult = validator.validateTranslationKeys(uniqueKeys);
    
    // 7. Display the results
    printValidationResults(validationResult);
    
    // 8. Set exit code based on validation result
    if (validationResult.missingTranslations.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function printValidationResults(results: ValidationResult) {
  console.log(`\n✅ Valid translations: ${results.validTranslations.length}`);
  
  if (results.missingTranslations.length === 0) {
    console.log('\n🎉 All translations are valid! No missing translations found.');
  } else {
    console.log(`\n❌ Missing translations: ${results.missingTranslations.length}`);
    console.log('\nList of missing translations:');
    
    results.missingTranslations.forEach(key => {
      console.log(`  - ${key}`);
    });
    
    console.log('\n⚠️ Validation failed. Some translations are missing.');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});