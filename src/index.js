import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import url from 'url';
import path from 'path';
import fs from 'mz/fs';

axios.defaults.adapter = httpAdapter;

const loader = (urlPath, dir) => {
  const { host, pathname } = url.parse(urlPath);
  const fileName = `${host}${pathname}`
    .split(new RegExp(/\W/))
    .filter(e => e !== '')
    .join('-')
    .concat('.html');
  const filePath = path.join(dir || path.resolve(), fileName);
  return axios(urlPath)
    .then((res) => {
      const response = {
        data: res.data,
        status: res.status,
        path: filePath,
      };
      return response;
    })
    .then((res) => {
      fs.writeFile(filePath, res.data);
      return res;
    });
};


export default loader;
