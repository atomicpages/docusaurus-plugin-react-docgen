# Docusaurus Plugin `react-docgen`

A Docusaurus 2.x plugin that help generate and consume auto-generated docs from `react-docgen`.

## Installation

Grab from NPM and install along with `react-docgen`:

```sh
npm i docusaurus-plugin-react-docgen react-docgen # or
yarn add docusaurus-plugin-react-docgen react-docgen
```

## Usage

Inside your `docusaurus.config.js` add to the `plugins` field and configure with the `src` option
with full glob support :+1:

```js
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-react-docgen',
      {
        // pass in a single string or an array of strings
        src: ['path/to/**/*.tsx', '!path/to/**/*test.*'],
        route: {
          path: '/docs/api',
          component: require.resolve('./src/components/MyDataHandler.js'),
          exact: true,
        },
      },
    ],
  ],
};
```

Any pattern supported by [`fast-glob`](https://github.com/mrmlnc/fast-glob) is allowed here
(including negations)

## Options

| Name            | Type                                                                                                             | Required | Description                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`           | `string` \| `string[]`                                                                                           | Yes      | Tell `react-docgen` where to ook for source files. Use relative, absolute, and/or globbing syntax                                                          |
| `global`        | `boolean`                                                                                                        | No       | Store results so they're [globally accessible](https://v2.docusaurus.io/docs/docusaurus-core#useplugindatapluginname-string-pluginid-string) in docusaurus |
| `route`         | [`RouteConfig`](https://v2.docusaurus.io/docs/lifecycle-apis#actions)                                            | No       | Makes docgen results accessible at the specified URL. Note `modules` cannot be overridden.                                                                 |
| `docgen`        | [docgen config](https://github.com/reactjs/react-docgen#source)                                                  | No       | Pass custom resolvers and handlers to `react-docgen`                                                                                                       |
| `parserOptions` | [babel parser options](https://github.com/reactjs/react-docgen#-parseroptions)                                   | No       | Pass custom options to `@babel/parser`                                                                                                                     |
| `babel`         | [docgen options](https://github.com/reactjs/react-docgen#-babelrc-babelrcroots-root-rootmode-configfile-envname) | No       | Pass specific options to `@babel/parse` that aids in resolving the correct babel config file                                                               |
