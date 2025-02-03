module.exports = {
  preset: 'react-native',
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "\\.styles\\.(ts|tsx)$",
    "\\.style\\.(ts|tsx)$",
    "styles\\.ts$",          
    "/styles/",
    "/themes/",
    "/interfaces/",
    "/assets/",
    "\\.d\\.ts$",
    "types\\.(ts|tsx)$",
    "\\.test\\.(ts|tsx)$",
    "/__tests__/",
    "\\.spec\\.(ts|tsx)$"
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.styles.{ts,tsx}",
    "!src/**/*.style.{ts,tsx}",
    "!src/**/styles.ts",
    "!src/styles/**/*",
    "!src/themes/**/*",
    "!src/assets/**/*",
    "!src/interfaces/**/*",
    "!src/**/*.types.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/__tests__/**/*",
    "!**/*.test.{ts,tsx}",
    "!**/__tests__/**/*",
    "!**/*.spec.{ts,tsx}",
    "!src/**/constants/*",
    "!src/**/constants.ts*",
    "!src/**/references.ts",
    "App.tsx"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|expo-secure-store|@unimodules|@sentry|@react-*|expo-.*|unimodules-*))"
  ]
};
