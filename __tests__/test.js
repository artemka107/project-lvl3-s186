import nock from 'nock';
import os from 'os';
import path from 'path';
import fs from 'mz/fs';
import loader from '../src';

nock.disableNetConnect();

const url = 'http://myservertest.com';

describe('download page', () => {
  let currentDir;
  const tmpdir = os.tmpdir();

  beforeEach(() =>
    fs.mkdtemp(path.join(tmpdir, 'test'))
      .then((dir) => {
        currentDir = '';
        currentDir += dir;
      }));

  test('test connect', async () => {
    nock(url)
      .get('/')
      .reply(200, 'test done');
    const response = await loader(url);
    expect(response.status).toBe(200);
  });

  test('test download with output dir', async () => {
    nock(url)
      .get('/')
      .reply(200, 'test done');
    const response = await loader(url, currentDir);
    expect(fs.readFile(response.path, 'utf8')).resolves.toBe('test done');
  });

  test('test download without output dir', async () => {
    nock(url)
      .get('/')
      .reply(200, 'test done');
    const response = await loader(url);
    expect(fs.readFile(response.path, 'utf8')).resolves.toBe('test done');
  });
});
