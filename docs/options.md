# Options

- [command list](#command-list)
- [`add`, `a` command options](#add-a-command-options)
- [`del`, `d` command options](#del-d-command-options)
- [`refresh`, `r` command options](#refresh-r-command-options)
- [`truncate`, `t` command options](#truncate-t-command-options)
- [`watch`, `w` command options](#watch-w-command-options)

## command list

| command  | alias | description                                 |
| -------- | ----- | ------------------------------------------- |
| add      | a     | add or update json-schema to database file  |
| del      | d     | delete json-schema from database file       |
| refresh  | r     | regenerate all json-schema in database file |
| truncate | t     | reset database file                         |
| init     | i     | create `.nozzlerc` and `.nozzlefiles`       |

## `add`, `a` command options

| option     | alias | description                                                                     |
| ---------- | ----- | ------------------------------------------------------------------------------- |
| project    | p     | tsconfig.json path                                                              |
| config     | c     | configuration file path                                                         |
| output     | o     | database file path                                                              |
| skip-error |       | skip compile error on source file                                               |
| types      |       | TypeScript type of source code. You can use interface, type alias, enum, class. |
| files      |       | TypeScript source code file path                                                |
| format     |       | generated json-schema save format: json, string, base64                         |

## `del`, `d` command options

| option     | alias | description                                                                     |
| ---------- | ----- | ------------------------------------------------------------------------------- |
| project    | p     | tsconfig.json path                                                              |
| config     | c     | configuration file path                                                         |
| output     | o     | database file path                                                              |
| skip-error |       | skip compile error on source file                                               |
| types      |       | TypeScript type of source code. You can use interface, type alias, enum, class. |
| files      |       | TypeScript source code file path                                                |

## `refresh`, `r` command options

| option     | alias | description                                             |
| ---------- | ----- | ------------------------------------------------------- |
| project    | p     | tsconfig.json path                                      |
| config     | c     | configuration file path                                 |
| output     | o     | database file path                                      |
| skip-error |       | skip compile error on source file                       |
| format     |       | generated json-schema save format: json, string, base64 |

## `truncate`, `t` command options

| option  | alias | description             |
| ------- | ----- | ----------------------- |
| project | p     | tsconfig.json path      |
| config  | c     | configuration file path |
| output  | o     | database file path      |

## `watch`, `w` command options

| option        | alias | description                                             |
| ------------- | ----- | ------------------------------------------------------- |
| project       | p     | tsconfig.json path                                      |
| config        | c     | configuration file path                                 |
| output        | o     | database file path                                      |
| skip-error    |       | skip compile error on source file                       |
| format        |       | generated json-schema save format: json, string, base64 |
| debounce-time |       | watch command debounce-time                             |
