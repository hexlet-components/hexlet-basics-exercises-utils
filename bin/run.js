#!/usr/bin/env node

import { program } from 'commander';

// https://ru.hexlet.io/blog/posts/skripty-moduli-i-biblioteki
// Импорт ровно одной функции правильной сигнатуры. Все остальное – кишки библиотеки
import { doSomething } from '../index.js';

program
  .version('0.0.1')
  .arguments('<path>')
  .description('split document.yml')
//   .option('-f, --format <type>', 'output format', 'stylish') // Дефолтный формат – 4 параметр
  .action((path) => {
    doSomething(path);
    // console.log(genDiff(path1, path2, program.opts().format));
  })
  .parse(process.argv);
