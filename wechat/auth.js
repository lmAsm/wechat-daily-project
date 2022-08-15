const config = require("../config");
const sha1 = require("sha1");
const { getUserDataAsync, parseXml, formatData } = require('../util/utils')

// 模板消息
const template = require('./template')

// 回复内容
const reply = require('./reply')

// {
//     signature: 'e7124b954d30c6bb8426301adfb8fc9fadd71c37', // 加密签名
//     echostr: '6579168912032616086', // 随机字符串
//     timestamp: '1660374676', // 时间戳
//     nonce: '946959084'   // 随机数字
// }
// 校验消息是否来自微信服务器：计算得出的signature加密签名，和微信传递过来的signature对比，相同代表消息来自微信服务器，如果不一样，说明不是微信服务器发来的消息
// 1. 将参与微信加密签名的三个参数（timestamp、nonce、token）按照字典序排序并组合在一起形成一个数组
// 2. 将数组里所有参数拼接成一个字符串，进行sha1加密
// 3. 加密完就生成了一个signature，进行对比，如果相同，返回echostr给微信服务器

module.exports = () => {
    return async (req, res, next) => {
        console.log('req=== ', req.query)
        const { signature, echostr, timestamp, nonce } = req.query
        const arr = [timestamp, nonce, config.token].sort()
        const str = arr.join('')
        const signatureStr = sha1(str)
        console.log('arr=== ', arr, str, signatureStr)

        if (req.method === 'GET') {
            if (signatureStr === signature) {
                res.send(echostr)
            } else {
                res.send('error')
            }
        } else if (req.method === 'POST') {
            // 微信服务器会将用户发送的数据以post请求的方式转发到开发服务器上
            // 验证消息来自微信服务器
            console.log('post=== ', signature, signatureStr)
            if (signatureStr !== signature) {
                res.send('error')
            }

            console.log('res.query===', req.query)
            // res.query=== {
            //     signature: '5d761e31c1bea8f1ea840f29d0d1133160c21637',
            //     timestamp: '1660464622',
            //     nonce: '762135891',
            //     openid: 'ouOxQ51Sub6AEVxAyDfwolzegy2w'
            // }

            // 获取用户消息
            const xmldata = await getUserDataAsync(req)

            // 解析xml数据
            const parseData = await parseXml(xmldata)

            // 格式化数据
            const formatResult =  formatData(parseData)
            console.log('formatResult==== ', formatResult)
            // formatResult====  {
            //     ToUserName: 'gh_09a96b11bbd7',
            //     FromUserName: 'ouOxQ51Sub6AEVxAyDfwolzegy2w',
            //     CreateTime: '1660466927',
            //     MsgType: 'text',
            //     Content: '888',
            //     MsgId: '23772170922213543'
            // }

            const options = reply(formatResult)
            console.log('options===== ', options)

            const replyMessage = template(options)
            console.log('replyMessage===== ', replyMessage)

            res.send(replyMessage)
        } else {
            res.send('error')
        }
    }
}