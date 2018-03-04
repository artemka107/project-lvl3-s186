import nock from 'nock';
import os from 'os';
import path from 'path';
import fs from 'mz/fs';
import loader from '../src';

nock.disableNetConnect();

const getPathToResourse = name =>
  path.join('/assets/', name);

const testFilesPath = '__tests__/fixtures/';
const pathToEmptyHtml = `${testFilesPath}empty.html`;
const pathToHtml = `${testFilesPath}resourse.html`;
const url = 'https://myservertest.com/courses/';
const dirPageFiles = 'myservertest-com-courses_files/';
const fileName = 'assets-file.png';

describe('download page', () => {
  let currentDir;
  const tmpdir = os.tmpdir();

  beforeEach(() =>
    fs.mkdtemp(path.join(tmpdir, 'test-'))
      .then((dir) => {
        currentDir = '';
        currentDir += dir;
      }));

  test('download page and with resourses', async () => {
    const responseHtml = await fs.readFile(pathToHtml, 'utf8');
    const file = await fs.readFile(path.join(testFilesPath, 'file.css'));
    const pathToFilesDir = path.join(currentDir, dirPageFiles);

    nock(url)
      .get('/')
      .reply(200, responseHtml)
      .get(getPathToResourse('file.png'))
      .reply(200, file)
      .get(getPathToResourse('file.css'))
      .reply(200, 'test data')
      .get(getPathToResourse('file'))
      .reply(200, 'test data');

    await loader(url, currentDir);
    const data = await fs.readFile(path.join(currentDir, dirPageFiles, fileName));
    const amountOfFiles = await fs.readdir(pathToFilesDir);

    expect(amountOfFiles.length).toBe(3);
    expect(data).toEqual(file);
  });

  test('should be with error', async () => {
    const newUrl = `${url}errorpath/`;
    nock(newUrl)
      .get('/')
      .reply(404);

    try {
      await loader(newUrl, currentDir);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 404');
    }
  });

  test('should be with error exist dir', async () => {
    const responseHtml = await fs.readFile(pathToEmptyHtml, 'utf8');

    nock(url)
      .get('/')
      .reply(200, responseHtml);

    try {
      await fs.mkdir(path.join(currentDir, dirPageFiles));
      await loader(url, currentDir);
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toMatch(/^EEXIST/);
    }
  });

  test('should be with error does not exist dir', async () => {
    const responseHtml = await fs.readFile(pathToEmptyHtml, 'utf8');

    nock(url)
      .get('/')
      .reply(200, responseHtml);

    try {
      await loader(url, path.join(currentDir, 'errorpath'));
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toMatch(/^ENOENT/);
    }
  });
});
