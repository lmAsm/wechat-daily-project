const { writeFile, readFile } = require('fs')
const axios = require('axios')
const { appId, appsecret, gaodeKey, xiAnCityCode } = require('../config')

class Wechat {
    constructor() {
    }

    // 获取token
    getAccessToken() {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appsecret}`
        return new Promise(((resolve, reject) => {
            axios({
                method: 'get',
                url,
                responseType: 'json'
            }).then(res => {
                console.log('res=====', res.data)
                const data = res.data
                // 设置accessToken过期时间， 设置提前5分钟过期
                data.expires_in = Date.now() + (data.expires_in - 5 * 60) * 1000
                resolve(data)
            })
        }))
    }

    // 保存token到本地
    saveAccessToken(token) {
        console.log('saveAccessToken==== ', token)
        const accessToken = JSON.stringify(token)
        return new Promise((resolve, reject) => {
            writeFile('./accessToken.txt', accessToken, err => {
                if (!err) {
                    console.log('token保存到文件成功~')
                    resolve()
                } else {
                    reject('token保存到文件失败啦')
                }
            })
        })
    }

    // 读取token
    readAccessToken() {
        return new Promise((resolve, reject) => {
            readFile('./accessToken.txt', (err, value) => {
                if (!err) {
                    console.log('token读取成功~')
                    try {
                        resolve(JSON.parse(value))
                    } catch (e) {
                        resolve('')
                    }
                } else {
                    reject('token读取失败~')
                }
            })
        })
    }

    // 判断token是否过期
    isValidAccessToken(data) {
        if (!data || !data.access_token || !data.expires_in) {
            return false
        }
        return data.expires_in > Date.now()
    }

    fetchAccessToken() {
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            console.log('走缓存')
            // 之前保存过且是有效的
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in,
            })
        }
        return this.readAccessToken()
            .then(async res => {
                // 本地有文件
                // 判断他是否过期
                if (this.isValidAccessToken(res)) {
                    // 有效
                    return Promise.resolve(res)
                } else {
                    // 过期了
                    // 发送请求获取access_token
                    const result = await this.getAccessToken()
                    await this.saveAccessToken(result)
                    return Promise.resolve(result)
                }
            })
            .catch(async err => {
                // 本地没有文件
                // 发送请求获取access_token
                const result = await this.getAccessToken()
                await this.saveAccessToken(result)
                return Promise.resolve(result)
            })
            .then(res => {
                // 将access_token挂载到this上
                this.access_token = res.access_token
                this.expires_in = res.expires_in

                return Promise.resolve(res)
            })
    }
}

module.exports = async () => {
    const wx = new Wechat()
    const token = await wx.fetchAccessToken()
    return token
    // let weatherinfo = await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?key=${gaodeKey}&city=${xiAnCityCode}&extensions=all&output=JSON`)
    // weatherinfo = weatherinfo.data
    // if (weatherinfo.status === '1') {
    //     let todayweather = weatherinfo.forecasts[0].casts[0]
    //     console.log('获取天气', todayweather)
    //     return {
    //         token,
    //         weather: todayweather
    //     }
    // }
}
// test
// wx.fetchAccessToken().then(res => console.log('fetch=== ', res))