const errCode = require('./util/errCode');
const axios = require('axios');
const { URL } = require('url');
const errorHandler = require('./util/errorHandler');

/**
 * @description 向临时对象发送消息
 * @param {string}             baseUrl      mirai-api-http server 的地址
 * @param {string}             sessionKey   会话标识
 * @param {number}             qq           目标 qq 号
 * @param {number}             group        目标群号
 * @param {number}             quote        消息引用，使用发送时返回的 messageId
 * @param {array[messageType]} messageChain 消息链，MessageType 数组
 * @returns {Object} 结构 { message, code, messageId }
 */
module.exports = async ({ baseUrl, sessionKey, qq, group, quote, messageChain }) => {
    try {
        // 拼接 url
        const url = new URL('/sendTempMessage', baseUrl).toString();

        // 请求
        let re;
        if (qq) {
            re = await axios.post(url, {
                sessionKey, qq, quote, messageChain
            });
        } else if (group) {
            re = await axios.post(url, {
                sessionKey, qq, quote, messageChain
            });
        } else {
            throw new Error('sendTempMessage 未提供 qq 及 group 参数');
        }
        let { data: { msg: message, code, messageId } } = re;

        // 抛出 mirai 的异常，到 catch 中处理后再抛出
        if (code in errCode) {
            throw new Error(message);
        }
        return messageId;
    } catch (error) {
        errorHandler(error);
    }

}