import url from 'url';
import Listr from 'listr';
import d from 'debug';
import path from 'path';
import fs from 'mz/fs';
import cheerio from 'cheerio';
import axios from './lib/axios';

const debug = d('page-loader:all');

const generateName = (str, extFile) => {
  const { dir, name, ext } = path.parse(str);
  const result = path.join(dir, name)
    .split(/\W/)
    .filter(e => e !== '')
    .join('-')
    .concat(extFile || ext);
  return result;
};


const getData = (resourses, urlPath) => {
  const queries = resourses.map(resourse =>
    ({
      title: path.join(urlPath, resourse),
      task: (ctx) => {
        const result = axios.get(resourse, {
          baseURL: urlPath,
          responseType: 'arraybuffer',
        });
        ctx.push(result);
        return result;
      },
    }));

  const extractData = data =>
    Promise.all(data)
      .then(response =>
        response.map((res, i) => {
          debug(`${resourses[i]} was ended with STATUS ${res.status}`);
          return { path: resourses[i], data: res.data };
        }));

  const tasks = new Listr(queries);
  return tasks.run([])
    .then(ctx => extractData(ctx));
};

const findResourses = (file) => {
  const tags = {
    script: 'src',
    link: 'href',
    img: 'src',
  };

  const $ = cheerio.load(file);
  const resourses = $('html')
    .find(Object.keys(tags)
      .map(name => `${name}[${tags[name]}]`)
      .join(','))
    .map((i, elem) => {
      const attr = tags[elem.name];
      return elem.attribs[attr];
    })
    .filter((i, elem) => !elem.match(/^http/))
    .toArray();

  debug(resourses.map(e => e).join('\n'));

  return resourses;
};

const loader = (urlPath, dir = path.resolve()) => {
  const { host, pathname } = url.parse(urlPath);
  const siteName = path.join(host, pathname);

  const saveData = (data) => {
    const dirForFiles = path.join(dir, generateName(siteName, '_files'));
    debug(dirForFiles, 'directory for files');
    return fs.mkdir(dirForFiles)
      .then(() =>
        Promise.all(data.map((elem) => {
          const pathToFile = path.join(dirForFiles, generateName(elem.path));
          return fs.writeFile(pathToFile, elem.data);
        })));
  };

  const pageName = generateName(`${host}/${pathname}`, '.html');
  const filePath = path.join(dir, pageName);

  return axios(urlPath)
    .then(res => fs.writeFile(filePath, res.data))
    .then(() => fs.readFile(filePath))
    .then(file => findResourses(file))
    .then(resourses => getData(resourses, urlPath))
    .then(res => saveData(res))
    .catch((e) => {
      throw new Error(e.message);
    });
};


export default loader;
