import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph';

interface NamespaceInfo {
  variableName: string;
  namespace: string;
}

/**
 * Analyzes TSX files and extracts translation keys
 */
export class TranslationAnalyzer {
  private project: Project;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
      skipFileDependencyResolution: true,
    });
  }

  /**
   * Analyzes a TSX file for translation keys
   */
  public analyzeFile(filePath: string): string[] {
    try {
      // Add the file to the project
      const sourceFile = this.project.addSourceFileAtPath(filePath);

      // Skip if the file doesn't import next-intl
      if (!this.hasNextIntlImport(sourceFile)) {
        return [];
      }

      // Find all namespace declarations
      const namespaces = this.findNamespaceDeclarations(sourceFile);
      if (namespaces.length === 0) {
        return [];
      }

      // Find all translation keys
      return this.findTranslationKeys(sourceFile, namespaces);
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Checks if the file imports next-intl
   */
  private hasNextIntlImport(sourceFile: SourceFile): boolean {
    let hasNextIntlImport = false;
    
    sourceFile.getImportDeclarations().forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier === 'next-intl') {
        hasNextIntlImport = true;
      }
    });
    
    return hasNextIntlImport;
  }

  /**
   * Finds all namespace declarations in the file
   */
  private findNamespaceDeclarations(sourceFile: SourceFile): NamespaceInfo[] {
    const namespaces: NamespaceInfo[] = [];
    
    // Get useTranslations name or alias
    const hookNames = this.getUseTranslationsHookNames(sourceFile);
    if (hookNames.length === 0) {
      return namespaces;
    }
    
    // Find all variable declarations that use the useTranslations hook
    sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(varDecl => {
      const initializer = varDecl.getInitializer();
      if (!initializer) return;
      
      const callExpr = initializer.asKind(SyntaxKind.CallExpression);
      if (!callExpr) return;
      
      const expression = callExpr.getExpression();
      const expressionText = expression.getText();
      
      // Check if the expression matches any of our hook names
      if (hookNames.includes(expressionText)) {
        const firstArg = callExpr.getArguments()[0];
        if (firstArg) {
          const namespace = this.getStringLiteralValue(firstArg);
          if (namespace) {
            namespaces.push({
              variableName: varDecl.getName(),
              namespace
            });
          }
        }
      }
    });
    
    return namespaces;
  }

  /**
   * Gets all the names/aliases of the useTranslations hook
   */
  private getUseTranslationsHookNames(sourceFile: SourceFile): string[] {
    const hookNames: string[] = [];
    
    sourceFile.getImportDeclarations().forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier === 'next-intl') {
        importDecl.getNamedImports().forEach(namedImport => {
          const name = namedImport.getName();
          const alias = namedImport.getAliasNode()?.getText();
          
          if (name === 'useTranslations') {
            hookNames.push(alias || name);
          }
        });
      }
    });
    
    return hookNames;
  }

  /**
   * Gets the string literal value from a node
   */
  private getStringLiteralValue(node: Node): string | null {
    if (node.getKind() === SyntaxKind.StringLiteral) {
      return node.asKind(SyntaxKind.StringLiteral)!.getLiteralValue();
    }
    return null;
  }

  /**
   * Finds all translation keys used in the file
   */
  private findTranslationKeys(sourceFile: SourceFile, namespaces: NamespaceInfo[]): string[] {
    const translationKeys: string[] = [];

    // Create a map for quick lookup of namespace by variable name
    const namespaceMap = new Map<string, string>();
    for (const { variableName, namespace } of namespaces) {
      namespaceMap.set(variableName, namespace);
    }

    // Find all call expressions
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
      const expression = callExpr.getExpression();
      const expressionText = expression.getText();
      
      // Check if the call is to one of our namespace variables
      if (namespaceMap.has(expressionText)) {
        const namespace = namespaceMap.get(expressionText)!;
        const firstArg = callExpr.getArguments()[0];
        
        if (firstArg) {
          const key = this.getStringLiteralValue(firstArg);
          if (key) {
            translationKeys.push(`${namespace}.${key}`);
          }
        }
      }
    });

    return translationKeys;
  }
}