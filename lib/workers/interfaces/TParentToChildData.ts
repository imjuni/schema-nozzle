import type IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import type IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import type IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import type readGeneratorOption from '@configs/readGeneratorOption';
import type IFileWithType from '@modules/interfaces/IFileWithType';
import type { AsyncReturnType } from 'type-fest';

type TParentToChildData =
  | {
      command: 'job';
      data: {
        resolvedPaths: IResolvedPaths;
        generatorOption: AsyncReturnType<typeof readGeneratorOption>;
        option: IAddSchemaOption | IRefreshSchemaOption;
        fileWithTypes: IFileWithType;
      };
    }
  | { command: 'start' }
  | { command: 'end' };

export default TParentToChildData;
