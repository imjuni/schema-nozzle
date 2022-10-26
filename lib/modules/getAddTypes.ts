import getAllExportedTypes from '@compilers/getAllExportTypes';
import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import getAddTypesFromPrompt from '@modules/getAddTypesFromPrompt';
import IFileWithType from '@modules/interfaces/IFileWithType';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither, TPickPass } from 'my-only-either';
import * as tsm from 'ts-morph';
import { LastArrayElement } from 'type-fest';

export default async function getAddTypes({
  project,
  option,
}: {
  project: tsm.Project;
  option: IAddSchemaOption;
}): Promise<PassFailEither<Error, IFileWithType[]>> {
  try {
    if (option.types == null || option.types.length <= 0) {
      const types = await getAddTypesFromPrompt({
        project,
        option,
        isMultipleSelect: option.multiple,
      });
      return pass(types);
    }

    const allExportedTypes = getAllExportedTypes({ project, option });

    if (allExportedTypes.type === 'fail') {
      throw allExportedTypes.fail;
    }

    const exportedTypeMap = allExportedTypes.pass.reduce<
      Record<string, LastArrayElement<TPickPass<ReturnType<typeof getAllExportedTypes>>>>
    >((aggregation, exportedType) => {
      return { ...aggregation, [exportedType.identifier]: exportedType };
    }, {});

    const filePathWithTypes = option.types
      .map((typeName) => exportedTypeMap[typeName])
      .map((exportedType) => {
        const filePathWithType: IFileWithType = {
          filePath: exportedType.filePath,
          typeName: exportedType.identifier,
        };

        return filePathWithType;
      });

    return pass(filePathWithTypes);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised get typescript files');
    return fail(err);
  }
}
