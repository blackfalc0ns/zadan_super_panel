import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const appDir = path.join(rootDir, 'src', 'app');
const featuresDir = path.join(appDir, 'features');

const businessNouns = [
  'vendor',
  'order',
  'payment',
  'settlement',
  'product',
  'bank',
  'owner',
  'store',
  'catalog',
  'customer',
  'driver',
  'dispute',
  'finance'
];

const allowedCoreServiceFiles = new Set(['auth.service.ts']);
const importPattern = /\b(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

function listFilesRecursively(directoryPath) {
  if (!existsSync(directoryPath) || !statSync(directoryPath).isDirectory()) {
    return [];
  }

  const entries = readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);
    return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
  });
}

function relativeAppPath(filePath) {
  return path.relative(appDir, filePath).replaceAll('\\', '/');
}

function relativeRootPath(filePath) {
  return path.relative(rootDir, filePath).replaceAll('\\', '/');
}

function failIfAny(message, values) {
  if (values.length === 0) {
    return;
  }

  console.error(message);
  values.forEach((value) => console.error(` - ${value}`));
  process.exitCode = 1;
}

function readImports(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const imports = [];

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    if (specifier) {
      imports.push(specifier);
    }
  }

  return imports;
}

function getFeatureNames() {
  return readdirSync(featuresDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function resolveFeatureImport(fromFile, specifier, featureNames) {
  if (specifier.startsWith('@')) {
    const [alias, ...remainderParts] = specifier.slice(1).split('/');
    if (!featureNames.includes(alias)) {
      return null;
    }

    return {
      feature: alias,
      entry: remainderParts.join('/')
    };
  }

  if (!specifier.startsWith('.')) {
    return null;
  }

  const absoluteBase = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    absoluteBase,
    `${absoluteBase}.ts`,
    `${absoluteBase}.tsx`,
    `${absoluteBase}.mts`,
    `${absoluteBase}.cts`,
    path.join(absoluteBase, 'index.ts'),
    path.join(absoluteBase, 'public-api.ts')
  ];

  const resolvedPath = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!resolvedPath) {
    return null;
  }

  const normalizedPath = path.normalize(resolvedPath);
  const relativeFeaturePath = path.relative(featuresDir, normalizedPath);

  if (relativeFeaturePath.startsWith('..')) {
    return null;
  }

  const segments = relativeFeaturePath.split(path.sep);
  return {
    feature: segments[0],
    entry: segments.slice(1).join('/').replaceAll('\\', '/').replace(/\.tsx?$/, '')
  };
}

function collectFeatureBoundaryViolations(featureNames) {
  const featureFiles = listFilesRecursively(featuresDir)
    .filter((filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts'));

  const violations = [];

  featureFiles.forEach((filePath) => {
    const currentFeature = path.relative(featuresDir, filePath).split(path.sep)[0];
    const imports = readImports(filePath);

    imports.forEach((specifier) => {
      const resolved = resolveFeatureImport(filePath, specifier, featureNames);
      if (!resolved || resolved.feature === currentFeature) {
        return;
      }

      if (resolved.entry === 'public-api') {
        return;
      }

      violations.push(`${relativeAppPath(filePath)} -> ${specifier}`);
    });
  });

  return violations;
}

function collectFeatureAliasImports(directoryPath, featureNames) {
  return listFilesRecursively(directoryPath)
    .filter((filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts'))
    .flatMap((filePath) => {
      const imports = readImports(filePath);
      return imports
        .filter((specifier) => {
          if (!specifier.startsWith('@')) {
            return false;
          }

          const [alias] = specifier.slice(1).split('/');
          return featureNames.includes(alias);
        })
        .map((specifier) => `${relativeAppPath(filePath)} -> ${specifier}`);
    });
}

const featureNames = getFeatureNames();

const coreModelsDir = path.join(appDir, 'core', 'models');
const coreServicesDir = path.join(appDir, 'core', 'services');
const sharedUiDir = path.join(appDir, 'shared', 'components', 'ui');

const coreModelFiles = listFilesRecursively(coreModelsDir).filter((filePath) => filePath.endsWith('.ts'));
const coreModelBusinessFiles = coreModelFiles
  .map(relativeAppPath)
  .filter((filePath) => businessNouns.some((noun) => filePath.toLowerCase().includes(noun)));

failIfAny(
  'Boundary check failed: src/app/core/models must stay generic and free of business model files.',
  coreModelBusinessFiles
);

failIfAny(
  'Boundary check failed: src/app/core/models must not import feature-owned code.',
  collectFeatureAliasImports(coreModelsDir, featureNames)
);

const coreServiceFiles = listFilesRecursively(coreServicesDir)
  .filter((filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts'));

const disallowedCoreServices = coreServiceFiles
  .map((filePath) => path.basename(filePath))
  .filter((fileName) => !allowedCoreServiceFiles.has(fileName));

failIfAny(
  'Boundary check failed: src/app/core/services currently allows only auth.service.ts.',
  disallowedCoreServices
);

failIfAny(
  'Boundary check failed: src/app/core/services must not import feature-owned code.',
  collectFeatureAliasImports(coreServicesDir, featureNames)
);

const sharedUiFiles = listFilesRecursively(sharedUiDir).filter((filePath) => /\.(ts|html|scss)$/.test(filePath));
const sharedUiBusinessFiles = sharedUiFiles
  .map(relativeAppPath)
  .filter((filePath) => businessNouns.some((noun) => filePath.toLowerCase().includes(noun)));

failIfAny(
  'Boundary check failed: src/app/shared/components/ui must stay generic and free of business UI files.',
  sharedUiBusinessFiles
);

failIfAny(
  'Boundary check failed: src/app/shared/components/ui must not import feature-owned code.',
  collectFeatureAliasImports(sharedUiDir, featureNames)
);

failIfAny(
  'Boundary check failed: cross-feature imports must go through each feature public-api surface.',
  collectFeatureBoundaryViolations(featureNames)
);

if (!process.exitCode) {
  console.log(
    `Boundary checks passed for ${relativeRootPath(coreModelsDir)}, ${relativeRootPath(coreServicesDir)}, ${relativeRootPath(sharedUiDir)}, and cross-feature public-api imports.`
  );
}
