import {
  readFile, writeFile, unlink, readdir, mkdir
} from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { existsSync } from 'fs';
import { deserialize } from 'v8';

const splitLesson = async (lesson) => {
  const { lessonPath, locales } = lesson;

  locales.forEach(async (locale) => {
    try {
      const localePath = path.join((lessonPath), locale);
      const data = await readFile(path.join(lessonPath, `description.${locale}.yml`), 'utf-8');
      const { theory, instructions, ...exerciseData } = yaml.load(data);

      if (!existsSync(localePath)) {
        await mkdir(localePath)
      }
      await writeFile(path.join(localePath, 'README.md'), theory);
      await writeFile(path.join(localePath, 'EXERCISE.md'), instructions);
      await writeFile(path.join(localePath, 'data.yml'), yaml.dump(exerciseData));

    } catch (err) {
      console.log('Ошибка при обработке урока: ', path.join(lessonPath, locale), err);
    }
  });
};

const removeDescriptionFile = async (lesson) => {
  const { name, path: lessonPath } = lesson;
  try {
    await unlink(path.join(lessonPath, name));
  } catch (err) {
    console.log('Не удалось удалить файл: ', path.join(lessonPath, name), err);
  }
};

const getLessons = (modulesDirPath) => readdir(modulesDirPath, { withFileTypes: true })
  .then((modules) => {
    const modulePaths = modules
      .filter((item) => item.isDirectory())
      .map((item) => path.join(modulesDirPath, item.name));

    const lessonPromises = modulePaths.map((module) => readdir(module, { withFileTypes: true })
      .then((lessons) => lessons
        .filter((item) => item.isDirectory())
        .map((item) => path.join(module, item.name))));

    return Promise.all(lessonPromises)
      .then((lessonPaths) => lessonPaths.flat());
  })
  .catch((err) => console.error('Ошибка при получении уроков:', err));

const getDescriptions = (lessons) => {
  const descriptionPromises = lessons.map(
    (lessonPath) => readdir(lessonPath, { withFileTypes: true })
      .then( (lessonDir) => {
        const regexp = new RegExp(/description\.(?<locale>.+).yml/);
        const descriptions = lessonDir
          .filter((item) => item.isFile() && regexp.test(item.name))

        const locales = descriptions
          .map(({ name }) => name.match(regexp).groups.locale);

        return {
          lessonPath,
          locales,
        };
      })
      .catch((err) => console.error('Ошибка при получении описания урока:', err, lessonPath)),
  );

  return Promise.all(descriptionPromises)
    .then((contents) => contents.flat());
};

const splitCourse = (modulesDirPath) => {
  let lessonsCount = 0;
  getLessons(modulesDirPath)
    .then((lessons) => {
      lessonsCount = lessons.length;
      const descriptions = getDescriptions(lessons);

      return descriptions;
    })
    .then((descriptions) => {
      console.log(`Всего уроков: ${lessonsCount}`);
      if (lessonsCount !== descriptions.length) {
        console.log(`уроки ${lessonsCount} !== описаниям ${descriptions.length}`);
      }
      descriptions.forEach((item, i) => {
        splitLesson(item);
        // NOTE: пока рано убирать файлы, тк поддерживается еще старая структура.
        // removeDescriptionFile(item);
        const counter = lessonsCount - 1 - i;
        console.log(`осталось обработать: ${counter}`);
      });

      console.log('успешно завершено');
    })
    .catch((err) => console.error(err));
};

export default splitCourse;
