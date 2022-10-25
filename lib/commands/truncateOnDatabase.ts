import ITruncateSchemaOption from '@configs/interfaces/ITruncateSchemaOption';
import saveDatabase from '@databases/saveDatabase';

export default async function truncateOnDatabase(option: ITruncateSchemaOption) {
  await saveDatabase(option, {});
}
