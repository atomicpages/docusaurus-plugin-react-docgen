# Docusaurus Plugin `react-docgen`

A Docusaurus 2.x plugin that help generate and consume auto-generated docs from `react-docgen`.

## Installation

Grab from NPM and install along with `react-docgen`:

```sh
npm i docusaurus-plugin-react-docgen react-docgen # or
yarn add docusaurus-plugin-react-docgen react-docgen
```

## Usage

Inside your `docusaurus.config.js` add to the `plugins` field and configure with the `src` option with full glob support :+1:

```js
module.exports = {
    plugins: [
        [
            'docusaurus-plugin-react-docgen',
            {
                // pass in a single string or an array
                src: [
                    'path/to/**/*.tsx',
                    '!path/to/**/*test.*',
                ]
            }
        ]
    ]
}
```

Any pattern supported by [`fast-glob`](https://github.com/mrmlnc/fast-glob) is allowed here (including negations)
