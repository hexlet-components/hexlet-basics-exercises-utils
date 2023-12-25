import {
  readFile, writeFile, unlink, readdir,
} from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const splitLesson = async (lesson) => {
  const { name, path: lessonPath } = lesson;

  try {
    const data = await readFile(path.join(lessonPath, name), 'utf-8');
    const { theory, instructions, ...exerciseData } = yaml.load(data);

    await writeFile(path.join(lessonPath, 'README.md'), theory);
    await writeFile(path.join(lessonPath, 'EXERCISE.md'), instructions);
    await writeFile(path.join(lessonPath, 'data.yml'), yaml.dump(exerciseData));
  } catch (err) {
    console.log('Ошибка при обработке урока: ', path.join(lessonPath, name), err);
  }
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
    (lesson) => readdir(lesson, { withFileTypes: true })
      .then(
        (contents) => contents
          .filter((item) => item.isFile() && item.name === 'description.ru.yml'),
      )
      .catch((err) => console.error('Ошибка при получении описания урока:', err, lesson)),
  );

  return Promise.all(descriptionPromises)
    .then((contents) => contents.flat());
};

const splitCourse = (modulesDirPath) => {
  let lessonsCount = 0;
  getLessons(modulesDirPath)
    .then((lessons) => {
      lessonsCount = lessons.length;
      return getDescriptions(lessons);
    })
    .then((descriptions) => {
      console.log(`Всего уроков: ${lessonsCount}`);
      if (lessonsCount !== descriptions.length) {
        console.log(`уроки ${lessonsCount} !== описаниям ${descriptions.length}`);
      }
      descriptions.forEach((item, i) => {
        splitLesson(item);
        removeDescriptionFile(item);
        const counter = lessonsCount - 1 - i;
        console.log(`осталось обработать: ${counter}`);
      });

      console.log('успешно завершено');
    })
    .catch((err) => console.error(err));
};

export default splitCourse;
