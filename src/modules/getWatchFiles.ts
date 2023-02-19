import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import type { TWatchSchemaBaseOption } from '#configs/interfaces/TWatchSchemaOption';
import fs from 'fs';
import ts from 'typescript';

export default function getWatchFiles(option: Pick<TWatchSchemaBaseOption, 'project'>): string[] {
  try {
    const configFile = ts.readConfigFile(option.project, (filePath: string) =>
      fs.readFileSync(filePath).toString(),
    );

    const files = (configFile.config as Partial<Record<string, string[]>>).include ?? [
      CE_DEFAULT_VALUE.WATCH_DEFAULT_GLOB,
    ];
    return files;
  } catch {
    return [CE_DEFAULT_VALUE.WATCH_DEFAULT_GLOB];
  }
}
