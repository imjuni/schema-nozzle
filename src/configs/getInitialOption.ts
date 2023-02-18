/**
 * create initial option
 *
 * @param output output file path
 * @param project tsconfig.json file path
 * @param listFile .nozzlefiles file path
 * @returns jsonc style configuration string
 */
export default function getInitialOption(output: string, project: string, listFile: string) {
  return `{
  // database file directory or filename
  "output": "${output}",

  // tsconfig.json file path
  "project": "${project}",
  
  // json-schema save format
  // 
  // * json: json object
  // * string: plain string
  // * base64: plain string > base64
  "format": "json",

  // use checkbox with multiple selections
  "multiple": true,

  // schema file listing filename
  "list-file": "${listFile}"

  // ts-json-schema-generator option
  "generatorOption": {
    "additionalProperties": true
  }
}`;
}
