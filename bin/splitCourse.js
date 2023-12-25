#!/usr/bin/env node

import { program } from 'commander';
import splitCourse from '../index.js';

program
  .version('0.0.1')
  .arguments('<path>')
  .description('Splits lesson descriptions of the course into README.md, exercise.md and data.yml ')
  .action((path) => {
    splitCourse(path);
  })
  .parse(process.argv);
