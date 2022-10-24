import IBaseOption from '@configs/interfaces/IBaseOption';
import IDatabaseRecord from '@modules/interfaces/IDatabaseRecord';
import inquirer from 'inquirer';

interface IGetTypesFromPrompt {
  db: Record<string, IDatabaseRecord | undefined>;
  option: IBaseOption;
}

export default async function getDeleteTypesFromPrompt({
  db,
}: IGetTypesFromPrompt): Promise<string[]> {
  const choiceAbleTypes = Object.entries(db)
    .map(([key, value]) => ({ key, value }))
    .filter((entry): entry is { key: string; value: IDatabaseRecord } => entry.value != null)
    .map((entry) => {
      return entry.value.id;
    });

  if (choiceAbleTypes.length <= 0) {
    throw new Error('Cannot found interface or type-alias on typescript source file');
  }

  const answer = await inquirer.prompt<{ typeName: string }>([
    {
      type: 'list',
      name: 'typeName',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      choices: choiceAbleTypes,
    },
  ]);

  return [answer.typeName];
}
