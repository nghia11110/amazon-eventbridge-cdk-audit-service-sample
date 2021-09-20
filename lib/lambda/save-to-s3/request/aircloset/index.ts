import axios, { AxiosStatic, Method, AxiosError, AxiosResponse } from 'axios';

const instance = axios.create({
  headers: {
    'Content-type': 'application/json',
  },
});

export type axiosParams = [
  string, // host
  string, // path
  any?, // post,putの時はAxiosRequestConfig。
  any? // get,deleteの時はAxiosRequestConfig。post,putの時は送るパラメータ(any)
];

interface ExtendAxios extends AxiosStatic {
  [key: string]: any;
}

const request = (method: Method) => async (...args: axiosParams) => {
  const host = args.shift();
  const path = args.shift();
  const config = args.shift(); 

  const url = `${host}${path}`;
  const configData = {
    headers: {
      'x-acidentifier': config.identifier,
      'Authorization': `Bearer ${config.token}`
    }
  };

  const res: AxiosResponse = await (instance as ExtendAxios)
    [method](url, ...args, configData)
    .catch(async (err: AxiosError) => {
      return Promise.reject(err);
    });

  return res;
};

export const get = request('get');
export const post = request('post');
export const put = request('put');
export const patch = request('patch');
export const del = request('delete');
