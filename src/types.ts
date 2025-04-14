export interface IntlValidatorConfig {
  projectRoot: string;
  translationFile: string;
}

export interface TranslationMap {
  [namespace: string]: {
    [key: string]: string | TranslationMap;
  };
}

export interface ValidationResult {
  missingTranslations: string[];
  validTranslations: string[];
}