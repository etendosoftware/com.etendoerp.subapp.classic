# Installation

## Configure NPM authentication

Edit your local `.npmrc` file to include authenticate always:

```
vi ~/.npmrc
```

Add the following lines to the bottom of the file:

```
registry=https://repo.futit.cloud/repository/npm-group/
always-auth=true
_auth=<the encoding in base64 of: <your Nexus user>:<your Nexus password>>
```

You can encode the auth [here](https://www.base64encode.org/)

## Adding Important files

You'll need to add the `debug.keystore` and `mobile-openbravo.jks` files to the `android/app` folder of your Etendo Mobile repository. Ask your Etendo Mobile manager for them.

## Installing dependencies and running

### iOS

```
yarn install
cd ios && pod install && cd ..
yarn run ios
```

### Android

```
yarn install
yarn start
yarn run android
```

## Etendo server

Make sure the following modules are installed in your Etendo server:

- com.smf.securewebservices
- com.smf.mobile.utils
- com.smf.mobile.scan (when using the inventory scan process)
- com.smf.ean128 (when using the inventory scan process)

## Code formatting

1. Make sure to have the 'Prettier' and 'Prettier ESLint' extensions installed in your VS Code:

```
Name: Prettier - Code formatter
Id: esbenp.prettier-vscode
Description: Code formatter using prettier
Publisher: Prettier
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
```

```
Name: Prettier ESLint
Id: rvest.vs-code-prettier-eslint
Description: A Visual Studio Extension to format JavaScript and Typescript code using prettier-eslint package
Publisher: Rebecca Vest
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint
```

2. Allow auto-format on save:

Open VS Code's Settings (File > Preferences > Settings) and check the box that says "Editor: Format on save"
