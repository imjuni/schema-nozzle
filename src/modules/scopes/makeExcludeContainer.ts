import type { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import type { TAddSchemaOption } from '#/configs/interfaces/TAddSchemaOption';
import type { TRefreshSchemaOption } from '#/configs/interfaces/TRefreshSchemaOption';
import { container } from '#/modules/containers/container';
import { EXCLUDE_CONTAINER_SYMBOL_KEY } from '#/modules/containers/keys';
import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { asValue } from 'awilix';
import type { getTypeScriptConfig } from 'ts-morph-short';

export function makeExcludeContainer(
  options: Pick<TAddSchemaOption | TRefreshSchemaOption, 'exclude' | 'project' | 'projectDir'>,
  tsconfig: ReturnType<typeof getTypeScriptConfig>,
  inlineExcludedFiles: ReturnType<typeof getInlineExcludedFiles>,
) {
  /**
   * SourceCode를 읽어서 inline file exclude 된 파일을 별도로 전달한다. 이렇게 하는 이유는, 이 파일은 왜 포함되지
   * 않았지? 라는 등의 리포트를 생성할 때 한 곳에서 이 정보를 다 관리해야 리포트를 생성해서 보여줄 수 있기 때문이다
   */
  const excludeContainer = new ExcludeContainer({
    patterns: getExcludePatterns(options, tsconfig),
    options: { absolute: true, ignore: defaultExclude, cwd: options.projectDir },
    inlineExcludedFiles,
  });

  container.register(EXCLUDE_CONTAINER_SYMBOL_KEY, asValue(excludeContainer));

  return excludeContainer;
}
