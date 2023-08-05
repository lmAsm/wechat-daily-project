
const { parseString } = require('xml2js')
const axios = require('axios')
const moment = require('moment')
const { templateId, gaodeKey, list } = require('../config')

module.exports = {
    // 接收用户发的消息 ，返回的格式时xml
    getUserDataAsync(req) {
        return new Promise(resolve => {
            let xmlData = ''
            req.on('data', data => {
                xmlData += data.toString()
            }).on('end', () => {
                // 数据接收完毕时会触发当前
                resolve(xmlData)
            })
        })
    },

    // xml格式数据转为对象
    parseXml(xmlData) {
        return new Promise((resolve, reject) => {
            parseString(xmlData, { trim: true }, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject('解析xml方法出错' + err)
                }
            })
        })
    },

    // 格式化数据
    formatData(data) {
        let newData = data.xml
        let message = {}
        if (typeof newData === 'object') {
            for (let key in newData) {
                let value = newData[key]
                if (Array.isArray(value) && value.length > 0) {
                    message[key] = value[0]
                }
            }
        }
        return message
    },

    // 每日天气消息推送
    sendDailyMsg (token, touser, wageDate, weatherinfo, birthday, name = '晨晨') {
        const week = ['日', '一', '二', '三', '四', '五', '六']
        const index = Math.floor(Math.random() * list.length)
        console.log('list====== ', index, list[index])
        axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token, {
            touser: touser,
            template_id: templateId, // 模板信息id
            topcolor: '#FF0000',
            data: {
                Name: {
                    value: name,
                    color: '#2b85e4'
                },
                Date: {
                    value: moment().format('YYYY-MM-DD') + ', ' + '星期' + week[moment().weekday()],
                    color: '#2b85e4'
                },
                Wage: {
                    value: '发工资',
                    color: '#ed4014'
                },
                BirthDayInfo: {
                    value: '生日',
                    color: '#ed4014'
                },
                WageDate: {
                    value: wageDate,
                    color: '#ed4014'
                },
                BirthDay: {
                    value: birthday,
                    color: '#ed4014',
                },
                Weather: {
                    value: weatherinfo.dayweather,
                    color: '#ff9900'
                },
                TemperatureLow: {
                    value: weatherinfo.nighttemp + '℃',
                    color: '#19be6b'
                },
                TemperatureHigh: {
                    value: weatherinfo.daytemp + '℃',
                    color: '#2d8cf0',
                },
                Sentence: {
                    value: list[index],
                    color: '#c84ecc'
                },
            }
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
            console.log(err)
        })
    },

    getWeather: async cityCode => {
        let weatherinfo = await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?key=${gaodeKey}&city=${cityCode}&extensions=all&output=JSON`)
        weatherinfo = weatherinfo.data
        if (weatherinfo.status === '1') {
            let todayweather = weatherinfo.forecasts[0].casts[0]
            console.log('获取天气', todayweather)
            return todayweather
        }
        return {}
    },

}