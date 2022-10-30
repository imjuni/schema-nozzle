import IAddSchemaOption from '@configs/interfaces/IAddSchemaOption';
import IRefreshSchemaOption from '@configs/interfaces/IRefreshSchemaOption';
import IResolvedPaths from '@configs/interfaces/IResolvedPaths';
import readGeneratorOption from '@configs/readGeneratorOption';
import IFileWithType from '@modules/interfaces/IFileWithType';
import { AsyncReturnType } from 'type-fest';

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
