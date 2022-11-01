# create-ts-json-schema

[![Download Status](https://img.shields.io/npm/dw/create-ts-json-schema.svg)](https://npmcharts.com/compare/create-ts-json-schema?minimal=true) [![Github Star](https://img.shields.io/github/stars/imjuni/create-ts-json-schema.svg?style=popout)](https://github.com/imjuni/create-ts-json-schema) [![Github Issues](https://img.shields.io/github/issues-raw/imjuni/create-ts-json-schema.svg)](https://github.com/imjuni/create-ts-json-schema/issues) [![NPM version](https://img.shields.io/npm/v/create-ts-json-schema.svg)](https://www.npmjs.com/package/create-ts-json-schema) [![License](https://img.shields.io/npm/l/create-ts-json-schema.svg)](https://github.com/imjuni/create-ts-json-schema/blob/master/LICENSE)

automatically generate json-schema from TypeScript source code and management it!

## What is create-ts-json-schema?

create-ts-json-schema is tiny cli utility that automatically generate json-schema from TypeScript source code and management generated json-schema. If you use fastify.js that uses json-schema to validate request and reply. But managing a large number of json-schema takes a lot of effort. create-ts-json-schema help that work.

![demo](ctjs_demo.gif)

## installation

```bash
npm install create-ts-json-schema --save-dev
```

## Usage

```bash
# generate json-schema and create database (if exist)
ctjs add

# delete json-schema from database
ctjs del

# truncate database
ctjs truncate

# regenerate all json-schema in database
```

## Fastify.js

Example for fastify

```ts
import fastify from 'fastify';
import fs from 'fs';

const server = fastify();
const db = JSON.parse((await fs.promises.readFile('db.json')).toString());
Object.value(db).forEach((record) => server.addSchema(JSON.parse(record.schema)));

server.get(
  '/pokemon/:name',
  {
    schema: {
      tags: ['Pokemon'],
      summary: 'Pokemon detail information using by name',
      querystring: { $ref: 'IReqPokeDetailQuerystring' }, // You can access local reference for fastify schema store
      params: { $ref: 'IReqPokeDetailParams' }, // You can access local reference for fastify schema store
      response: {
        200: { $ref: 'IPokemonDto' }, // You can access local reference for fastify schema store
      },
    },
  },
  (req) => {
    /* your handler code */
  },
);
```

## command and option

### command

| command  | alias | description                                 |
| -------- | ----- | ------------------------------------------- |
| add      | a     | add or update json-schema to database file  |
| del      | d     | delete json-schema from database file       |
| refresh  | r     | regenerate all json-schema in database file |
| truncate | t     | reset database file                         |

### add option

| option     | alias | description                                                                     |
| ---------- | ----- | ------------------------------------------------------------------------------- |
| project    | p     | tsconfig.json path                                                              |
| config     | c     | configuration file path                                                         |
| output     | o     | database file path                                                              |
| skip-error |       | skip compile error on source file                                               |
| types      |       | TypeScript type of source code. You can use interface, type alias, enum, class. |
| files      |       | TypeScript source code file path                                                |
| format     |       | generated json-schema save format: json, string, base64                         |

### delete option

| option     | alias | description                                                                     |
| ---------- | ----- | ------------------------------------------------------------------------------- |
| project    | p     | tsconfig.json path                                                              |
| config     | c     | configuration file path                                                         |
| output     | o     | database file path                                                              |
| skip-error |       | skip compile error on source file                                               |
| types      |       | TypeScript type of source code. You can use interface, type alias, enum, class. |
| files      |       | TypeScript source code file path                                                |

### refresh option

| option     | alias | description                                             |
| ---------- | ----- | ------------------------------------------------------- |
| project    | p     | tsconfig.json path                                      |
| config     | c     | configuration file path                                 |
| output     | o     | database file path                                      |
| skip-error |       | skip compile error on source file                       |
| format     |       | generated json-schema save format: json, string, base64 |

### truncate option

| option  | alias | description             |
| ------- | ----- | ----------------------- |
| project | p     | tsconfig.json path      |
| config  | c     | configuration file path |
| output  | o     | database file path      |
