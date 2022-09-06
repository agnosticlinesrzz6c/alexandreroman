"use strict";

const {
  errCodeMap
} = require('../util/errCode');

const axios = require('axios');

let URL;

if (!process.browser) {
  ({
    URL
  } = require('url'));
} else {
  URL = window.URL;
}

const errorHandler = require('../util/errorHandler');
/**
 * @description 删除群文件
 * @param {string} baseUrl    mirai-api-http server 的地址
 * @param {string} sessionKey 会话标识
 * @param {number} target     群号
 * @param {number} id         文件 id
 * @returns {Object} 结构 { message, code }
 */


module.exports = async ({
  baseUrl,
  sessionKey,
  target,
  id
}) => {
  try {
    // 拼接 url
    const url = new URL('/groupFileDelete', baseUrl).toString(); // 请求

    const responseData = await axios.post(url, {
      sessionKey,
      target,
      id
    });

    try {
      var {
        data: {
          msg: message,
          code
        }
      } = responseData;
    } catch (error) {
      throw new Error('core.groupFileDelete 请求返回格式出错，请检查 mirai-console');
    } // 抛出 mirai 的异常，到 catch 中处理后再抛出


    if (code in errCodeMap) {
      throw new Error(message);
    }

    return {
      message,
      code
    };
  } catch (error) {
    errorHandler(error);
  }
};