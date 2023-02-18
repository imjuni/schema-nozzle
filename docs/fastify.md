# Fastify.js example

- [Create new project using fastify-cli](#create-new-project-using-fastify-cli)
- [`schema-nozzle` setup](#schema-nozzle-setup)
- [Load json-schema to fastify](#load-json-schema-to-fastify)
- [Add new DTO interface](#add-new-dto-interface)
- [Add new route and API](#add-new-route-and-api)
- [Test new API](#test-new-api)
- [Swagger](#swagger)

## Create new project using fastify-cli

Start empty project using [fastify-cli](https://github.com/fastify/fastify-cli)

```bash
npx fastify-cli generate nozzle --lang=ts
cd nozzle
npm install
```

## `schema-nozzle` setup

`schema-nozzle` initialize,

```bash
npm install schema-nozzle -D
npx nozzle init
```

change output directory for _fastify-autoload_. Open `.nozzlerc` file and change like that,

```json
{
  // database file directory or filename
  // [as-is] "db.json" > [to-be] "src/db.json"
  "output": "src/db.json"

  // ... another configuration
}
```

Open `tsconfig.json` file and change like that,

```json
{
  "extends": "fastify-tsconfig",
  "compilerOptions": {
    "outDir": "dist",
    "sourceMap": true,
    "resolveJsonModule": true, // add
    "esModuleInterop": true // add
  },
  "include": ["src/**/*.ts"]
}
```

## Load json-schema to fastify

Schema DB add to fastify instance.

```ts
import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
// import db.json
import db from './db.json';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Add schema to fastify instance from db.json
  Object.values(db).forEach((item) => fastify.addSchema(item.schema));

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: opts,
  });
};

export default app;
export { app, options };
```

## Add new DTO interface

Write DTO interface like that,

```bash
mkdir src/dto
```

```ts
// You have to add this content where src/dto/IReqPokeDetailDto.ts

export interface IReqPokeDetailQuerystring {
  /**
   * transaction id on each request
   * @format uuid
   */
  tid: string;
}

export interface IReqPokeDetailParams {
  /**
   * Pokemon name
   */
  name: string;
}
```

## Add new route and API

```bash
mkdir routes/pokemon
mkdir routes/pokemon/_name
touch routes/pokemon/_name/index.ts
```

```ts
// routes/pokemon/_name/index.ts
import { FastifyPluginAsync } from 'fastify';

const pokemon: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Params: { name: string } }>(
    '/',
    {
      schema: {
        params: { $ref: 'IReqPokeDetailParams' },
        querystring: { $ref: 'IReqPokeDetailQuerystring' },
      },
    },
    async function (request, reply) {
      console.log(request.params.name);
      return { name: `pokemon name: ${request.params.name}` };
    },
  );
};

export default pokemon;
```

## Test new API

```bash
# You can see 400
curl http://localhost:3000/pokemon/pikachu

# works fine!
curl http://localhost:3000/pokemon/pikachu?tid=16DB8729-7113-42DF-A898-687537040ACC
```

## Swagger

```bash
npm i @fastify/swagger @fastify/swagger-ui -S
```

Open `src/app.ts` file and change like that,

```ts
import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import Swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
import db from './db.json';

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Add schema
  Object.values(db).forEach((item) => fastify.addSchema(item.schema));

  // swagger configuration
  void fastify.register(Swagger, {
    openapi: {
      info: {
        title: 'schema-nozzle',
        version: '1.0.0', // your version
      },
    },
  });

  // swagger-ui configuration
  void fastify.register(SwaggerUI, {
    routePrefix: '/swagger.io',
    uiConfig: {
      deepLinking: true,
      filter: true,
    },
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    options: opts,
  });
};

export default app;
export { app, options };
```

You can open `http://localhost:3000/swagger.io` and you can see swagger documentation.
