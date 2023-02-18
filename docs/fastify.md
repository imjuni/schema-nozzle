# Fastify.js example

Start empty project using [fastify-cli](https://github.com/fastify/fastify-cli)

```bash
npx fastify-cli generate nozzle --lang=ts
cd nozzle
npm install
mkdir src/dto
```

Write DTO interface like that,

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

`schema-nozzle` initialize,

```bash
npm install schema-nozzle -D
npx nozzle init
npx nozzle refresh
```

```ts
import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fs from 'fs';

// create server instance
const server = fastify();

// db.json file load and parse it
const db = JSON.parse((await fs.promises.readFile('../db.json')).toString());

// json-schema add in fastify instance
Object.value(db).forEach((record) => server.addSchema(JSON.parse(record.schema)));

server.get(
  '/pokemon/:name',
  {
    schema: {
      tags: ['Pokemon'],
      summary: 'Pokemon detail information using by name',

      // You can access local reference for fastify schema store
      querystring: { $ref: 'IReqPokeDetailQuerystring' },

      // You can access local reference for fastify schema store
      params: { $ref: 'IReqPokeDetailParams' },

      response: {
        // You can access local reference for fastify schema store
        200: { $ref: 'IPokemonDto' },
      },
    },
  },
  (req) => {
    /* your handler code */
  },
);
```
