/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const buildFullPath = (filepath) => path.resolve(process.cwd(), filepath);
const getData = (filepath) => (fs.readFileSync(filepath, 'utf-8'));

export const doSomething = (modulePath) => {
  const filePath = buildFullPath(modulePath);
  const data = getData(buildFullPath(filePath));
  const { theory, instructions, ...exerciseData } = yaml.load(data);

  // const options = {
  //     styles: {
  //         '!!str': '|'
  //     }
  // };

  fs.writeFileSync(buildFullPath('./__fixtures__/README.md'), theory);
  fs.writeFileSync(buildFullPath('./__fixtures__/EXERCISE.md'), instructions);
  fs.writeFileSync(buildFullPath('./__fixtures__/data.yml'), yaml.dump(exerciseData));
};
