const express = require('express')
const moment = require('moment')
const auth = require('./wechat/auth')
const app = express();

const { mineOpenId, beijingCityCode, xiAnCityCode, laichenOpenId } = require('./config')
// 每日推送
const getToken = require('./wechat/accessToken')
const { sendDailyMsg, getWeather } = require('./util/utils')
const {raw} = require("express");

// 验证服务器有效性
app.use(auth())

function getLastDayOfMonth() {
    const today = moment()
    let date2 = moment(today).endOf('month')
    const day = moment(date2).format('E')
    if (day == '7') {
        date2 = moment(date2).subtract(2, 'day')
    } else if (day == '6') {
        date2 = moment(date2).subtract(1, 'day')
    }
    return date2.diff(today, 'days')
}

const cycle = setInterval(async function () {
    const h = moment().hour();
    const m = moment().minute();
    if (h === 9 && m === 0) {
        console.log('开始发送消息')
        getToken()
            .then(async token => {

                const today = moment()

                console.log('sendMessagexxx===', token)
                const lastWage = moment(moment().format('YYYY-MM-10'), 'YYYY-MM-DD').add(1, 'M')
                const wageDate = lastWage.diff(today, 'days')

                // 给自己发
                const weather = await getWeather(beijingCityCode)
                sendDailyMsg(token.access_token, mineOpenId, wageDate, weather)

                // 给lc发
                const leftDays = getLastDayOfMonth()
                const xianWeather = await getWeather(xiAnCityCode)
                sendDailyMsg(token.access_token, laichenOpenId, leftDays, xianWeather)

            })
            .catch(err => {
                console.log('sendMessage err==== ', err)
                clearInterval(cycle)
            })
    }
}, 1000 * 60)

app.listen(3000, () => console.log('服务器启动成功...'))