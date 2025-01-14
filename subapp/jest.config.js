module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|expo-secure-store|@unimodules|@sentry|@react-*|expo-.*|unimodules-*))"
  ]
};
