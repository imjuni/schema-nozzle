/**
 * create initial option
 *
 * @param output output file path
 * @param project tsconfig.json file path
 * @returns jsonc style configuration string
 */
export function getInitialOption(output: string, project: string, includeGlob: string[]) {
  return `{
  // database file directory or filename
  "output": "${output}",

  // tsconfig.json file path
  "project": "${project}",

  // use checkbox with multiple selections
  "multiple": true,

  // json-schema draft version
  // recommand using draft 7
  "draft": 7,

  // display cli logo
  "cli-logo": false,

  // file glob pattern for schema generation
  "include": ${JSON.stringify(includeGlob)},

  // ts-json-schema-generator option
  "generatorOption": {
    "additionalProperties": true
  }
}`;
}
