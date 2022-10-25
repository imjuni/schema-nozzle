# create-ts-json-schema

automatically generate json-schema from TypeScript source code and management it!

## What is create-ts-json-schema?

create-ts-json-schema is tiny cli utility that automatically generate json-schema from TypeScript source code and management generated json-schema. If you use fastify.js that uses json-schema to validate request and reply. But managing a large number of json-schema takes a lot of effort. create-ts-json-schema help that work.

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

| option     | alias | description                       |
| ---------- | ----- | --------------------------------- |
| project    | p     | tsconfig.json path                |
| config     | c     | configuration file path           |
| output     | o     | database file path                |
| skip-error |       | skip compile error on source file |

### truncate option

| option  | alias | description             |
| ------- | ----- | ----------------------- |
| project | p     | tsconfig.json path      |
| config  | c     | configuration file path |
| output  | o     | database file path      |
