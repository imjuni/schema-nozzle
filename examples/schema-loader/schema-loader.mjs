import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import pathe from 'pathe';
import { fileURLToPath } from 'url';

const ajv = new Ajv();
ajvFormats(ajv);

const dirPath = pathe.dirname(fileURLToPath(import.meta.url));
const filePath = pathe.join(dirPath, '..', 'type-project', 'db.json');

// console.log(filePath);
const buf = await fs.promises.readFile(filePath);
const data = parse(buf.toString());

console.log('schema id generation style: ', data.$store.style);

if (data.$store.style === 'id') {
  const added = Object.keys(data.$store.store).map((key) => {
    ajv.addSchema(data.$store.store[key]);
    return key;
  });

  console.log('add-schema: ', '[', added.join(', '), ']');

  const validator = ajv.getSchema('TSimpleSetRequired<I18nDto,"used">');
  const r01 = validator({
    used: ['en', 'ja'],
    id: '1',
    language: 'en',
    content: 'hello world!',
  });
  console.log(r01);
} else if (data.$store.style === 'id-with-path') {
  Object.keys(data.$store.store).forEach((key) => {
    console.log('add-schema: ', key);
    ajv.addSchema(data.$store.store[key]);
  });
} else if (data.$store.style === 'definitions') {
  console.log('add-schema: ', data.$store.store.$id);
  ajv.addSchema(data.$store.store);
} else {
  console.log('add-schema: ', data.$store.store.$id);
  ajv.addSchema(data.$store.store);
}
