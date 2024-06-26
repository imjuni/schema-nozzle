# schema-nozzle

![ts](https://flat.badgen.net/badge/Built%20With/TypeScript/blue)
[![Download Status](https://img.shields.io/npm/dw/schema-nozzle.svg?style=flat-square)](https://npmcharts.com/compare/schema-nozzle)
[![Github Star](https://img.shields.io/github/stars/imjuni/schema-nozzle.svg?style=flat-square)](https://github.com/imjuni/schema-nozzle)
[![Github Issues](https://img.shields.io/github/issues-raw/imjuni/schema-nozzle.svg?style=flat-square)](https://github.com/imjuni/schema-nozzle/issues)
[![NPM version](https://img.shields.io/npm/v/schema-nozzle.svg?style=flat-square)](https://www.npmjs.com/package/schema-nozzle)
[![schema-nozzle](https://github.com/imjuni/schema-nozzle/actions/workflows/ci.yml/badge.svg?style=flat-square)](https://github.com/imjuni/schema-nozzle/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/schema-nozzle.svg?style=flat-square)](https://github.com/imjuni/schema-nozzle/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/imjuni/schema-nozzle/branch/master/graph/badge.svg?token=cYJEAvZUFU)](https://codecov.io/gh/imjuni/schema-nozzle)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

`schema-nozzle` generates JSON Schema from TypeScript interfaces, type aliases, classes, and enums. When developing a RESTful API server using frameworks like Express.js or Fastify.js, you might have experienced the need to write both JSON Schema and TypeScript types. Although the code is different, the meaning is the same, making it feel like doing the same work twice. To solve this problem, tools like [json-schema-to-ts](https://www.npmjs.com/package/json-schema-to-ts) are used. Schema-nozzle does the reverse of json-schema-to-ts, automating the process of converting TypeScript types into JSON Schema.

Why `schema-nozzle`?

- Generates JSON Schema from TypeScript types.
- Integrates well with documentation tools like [JSDoc](https://jsdoc.app/) and [TypeDoc](https://typedoc.org/) as it uses TypeScript types.
- When using Fastify, it can automate validation and automatically generate Swagger documentation.
- Supports various shapes of generating JSON Schema.

Strict JSON data validations are need many effort. You can reduce effort using `schema-nozzle` and Feel free 🤩!

## Table of Contents <!-- omit in toc -->

- [Getting Started](#getting-started)
- [Installation](#installation)
- [How it works?](#how-it-works)
  - [TypeScript interface](#typescript-interface)
  - [json-schema](#json-schema)
- [Usage](#usage)
- [Performance](#performance)
- [Example using fastify.js](#example-using-fastifyjs)
- [Recommand option](#recommand-option)
- [Relate To](#relate-to)
- [Roadmaps](#roadmaps)
- [License](#license)

## Getting Started

```bash
npx schema-nozzle init
npx schema-nozzle refresh
```

You can create configuration and list file using init command. And you can run refresh command, `schema-nozzle` generate `json-schema` from `interface`, `type alias`, `class` and `enum`.

You can see this mechanics!

![demo](assets/ctjs_demo.gif)

## Installation

```bash
npm install schema-nozzle --save-dev
```

## How it works?

`schema-nozzle` using **TypeScript Compiler API**. So `schema-nozzle` exactly know `interface`, `type alias`, `class` and `enum`.

```mermaid
graph LR

INP_TI[interface] --> SN[schema-nozzle]
INP_TT[type alias] --> SN[schema-nozzle]
INP_TC[class] --> SN[schema-nozzle]
INP_TE[enum] --> SN[schema-nozzle]
SN --> |exported| DB[db.json]
SN --> |not exported| IG[ignored]
```

- `schema-nozzle` generate json-schema using [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)
- `.nozzlefiles` file follow [gitignore spec.](https://git-scm.com/docs/gitignore)
- only generated exported `interface`, `type alias`, `class` and `enum`

Here is real example,

### TypeScript interface

This is input source file.

```ts
export interface I18nDto {
  /** i18n resource id */
  id: string;

  /**
   * iso639-1 language code
   *
   * @minLength 2
   * @maxLength 5
   * */
  language: string;

  /** i18n resource content */
  content: string;

  /**
   * i18n resource use on
   *
   * @minItems 1
   * @maxItems 10
   * */
  used?: string[];
}
```

### json-schema

This is output json-schema.

```json
{
  "I18nDto": {
    "id": "I18nDto",
    "filePath": "I18nDto.ts",
    "dependency": {
      "import": {
        "name": "I18nDto",
        "from": []
      },
      "export": {
        "name": "I18nDto",
        "to": [
          "IForeginStudentDto33",
          "IForeginStudentDto",
          "IReqReadStudentQuerystring",
          "IStudentDto",
          "IProfessorDto"
        ]
      }
    },
    "schema": {
      "$id": "I18nDto",
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "i18n resource id"
        },
        "language": {
          "type": "string",
          "description": "iso639-1 language code",
          "minLength": 2,
          "maxLength": 5
        },
        "content": {
          "type": "string",
          "description": "i18n resource content"
        },
        "used": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "i18n resource use on",
          "minItems": 1,
          "maxItems": 10
        }
      },
      "required": ["id", "language", "content"],
      "additionalProperties": false
    }
  }
}
```

You can use this schema like that,

```ts
// use ajv schema store
import Ajv from 'ajv';

const ajv = new Ajv();
const db = JSON.parse((await fs.readFile('db.json')).toString());
Object.values(db).forEach((item) => ajv.addSchema(item.schema));

const validator = ajv.compile({ $ref: 'I18nDto' });
```

or

```ts
// don't use schema store
import Ajv from 'ajv';

const ajv = new Ajv();
const db = JSON.parse((await fs.readFile('db.json')).toString());
const validator = ajv.compile(db['I18nDto'].schema);
```

## Usage

You can see help from `--help` option.

```bash
# display help for each commands
npx schema-nozzle --help

# display help for add commands
npx schema-nozzle add --help

# display help for del commands
npx schema-nozzle del --help

# display help for refresh commands
npx schema-nozzle refresh --help

# display help for truncate commands
npx schema-nozzle truncate --help

# display help for watch commands
npx schema-nozzle watch --help
```

Also you can see detail option [here](/docs/options.md).

## Performance

0.19.0 version enhance performance. Now remove pain point from mass schema generation.

![benchmark](assets/schema_nozzle_to_be_002.png)

This image is result of 388 schema extraction using M1 macbook pro(16GB RAM, 1TB SSD, 10core). `schema-nozzle` spent only `6.14` second! 🙌 🙆

## Example using fastify.js

A complete example of using schema-nozzle to create a swagger.io document and use json-schema to process input-output value verification can be found at [Ma-eum](https://github.com/imjuni/maeum). See the example of how DTO type declaration handles swagger.io document creation, json-schema creation, and typedoc document creation all at once!

- fastify with schema-nozzle [example](/docs/fastify.md)

## Recommand option

`extraTags` and `additionalProperties` options enable in `.nozzlerc`

```json
{
  "tsconfig": "./tsconfig.json",
  "list-file": "./.nozzlefiles",
  "cli-logo": true,
  "generatorOption": {
    "additionalProperties": true,
    "extraTags": ["example"]
  }
}
```

`additionalProperties` option permit additional properties in request object. And `extraTags` option can add to `example` field for swagger.io document.

## Relate To

- [ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator)
  - json-schema generator
- [ts-morph](https://github.com/dsherret/ts-morph)
  - TypeScript Compiler API wrapper

## Roadmaps

- [x] add watch command: watch `.nozzlefiles` list and add/del schema
- [x] enhance init command: find varity name of tsconfig. eg. tsconfig.\*.json
- [ ] tag support each schema
- [x] load, get, set interface for schema store
- [ ] documentation site
- [x] $id field enhance: enclude directory path like `#/greeting/hello/world`
- [x] add more test

## License

This software is licensed under the [MIT](https://github.com/imjuni/schema-nozzle/blob/master/LICENSE).
