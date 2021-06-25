/**
 * @description 为事件处理器提供中间件
 * @use 在 MiddleWare 的实例上链式调用需要的中间件方法，最后
 * 调用 done 并传入一个回调函数，该函数将在中间件结束后被调用
 * 
 * 每个方法将向 this.middleWares 中 push 一个中间件，最后对 done 的
 * 调用将返回一个函数，该函数用于遍历所有中间件，然后调用开发者的回调函数
 */
class MiddleWare {
    constructor() {
        this.middleWares = [];
    }

    /**
     * @description 自动重新登陆
     * @param {Bot}    bot      欲重新登陆的 Bot 实例
     * @param {string} baseUrl  mirai-api-http server 的地址
     * @param {string} authKey  mirai-api-http server 设置的 authKey
     * @param {string} password 欲重新登陆的 qq 密码
     */
    autoReLogin({ bot, baseUrl, authKey, password }) {
        const { Bot } = require('./Mirai-js');
        this.middleWares.push(async (data) => {
            await Bot.sendCommand({
                baseUrl,
                authKey,
                command: '/login',
                args: [data.qq, password],
            });
            await bot.open();
        });
        return this;
    }

    /**
     * @description 过滤出指定类型的消息，消息类型为 key，对应类型的
     *              message 数组为 value，置于 data.classified
     * @param {array[string]} typeArr message 的类型，例如 Plain Image Voice
     */
    filter(typeArr) {
        this.middleWares.push(data => {
            const result = {};
            typeArr.forEach((type) => {
                result[type] = data.messageChain.filter((message) => message.type == type);
            });
            return {
                result,
                fieldName: 'classified',
            };
        });
        return this;
    }

    /**
     * @description 过滤出字符串类型的 message，并拼接在一起，置于 data.text
     */
    filtText() {
        this.middleWares.push(data => {

            return {
                result: data.messageChain
                    .filter((val) => val.type == 'Plain')
                    .map((val) => val.text)
                    .join(''),
                fieldName: 'text',
            }
        });
        return this;
    }

    /**
     * @description 生成一个带有中间件的事件处理器
     * @param {function} callback 事件处理器
     */
    done(callback) {
        // 返回一个函数，该函数用于遍历所有中间件，然后调用开发者的回调函数
        return async data => {
            // 这里本来使用的是 forEach，但是 forEach 内部实现并不是同步的
            for (const middleWare of this.middleWares) {
                // 不直接解构的原因是，有些中间件无返回值
                const re = await middleWare(data);
                if (re) {
                    const { result, fieldName } = re;
                    data[fieldName] = result;
                }
            }

            if (callback instanceof Function) {
                callback(data);
            }
        }
    }
}

module.exports = MiddleWare;