const express = require('express')
const moment = require('moment')
const lunar = require('chinese-lunar-calendar')

const auth = require('./wechat/auth')
const app = express();

const { mineOpenId, beijingCityCode, xiAnCityCode, laichenOpenId, laichenBirthday, myBirthday } = require('./config')

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

// dateStr是农历生日
function getBirthDay(dateStr) {
    // todayLunarDate 今天的农历日期
    const lunarData = lunar.getLunar(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
    let todayLunarDate = `${new Date().getFullYear()}-${lunarData.lunarMonth}-${lunarData.lunarDate}`
    if (new Date(todayLunarDate).getTime() - new Date(dateStr).getTime() > 0) {
        // 说明今年的生日已经过了
        const nextDateStr = moment(dateStr, 'YYYY-MM-DD').add(1, 'Y')
        return moment(nextDateStr).diff(moment(new Date(todayLunarDate)), 'days')
    } else {
        return moment(dateStr).diff(moment(new Date(todayLunarDate)), 'days')
    }

}

const cycle = setInterval(async function () {
    const h = moment().hour();
    const m = moment().minute();
    if ((h === 9 && m === 0)) {
        console.log('开始发送消息')
        getToken()
            .then(async token => {

                const today = moment()

                console.log('sendMessagexxx===', token)
                let lastWage = moment(moment().format('YYYY-MM-10'), 'YYYY-MM-DD')
                if (new Date(moment().format('YYYY-MM-DD')).getTime() - new Date(moment().format('YYYY-MM-10')).getTime() > 0) {
                    // 今天已经过了发工资的日期了
                    lastWage = moment(moment().format('YYYY-MM-10'), 'YYYY-MM-DD').add(1, 'M')
                }
                const wageDate = lastWage.diff(today, 'days')

                // 给自己发
                const weather = await getWeather(beijingCityCode)
                const myDate = getBirthDay(`${new Date().getFullYear()}-${myBirthday}`)
                sendDailyMsg(token.access_token, mineOpenId, wageDate, weather, myDate)

                // 给lc发
                const leftDays = getLastDayOfMonth()
                const xianWeather = await getWeather(xiAnCityCode)
                const lcDate = getBirthDay(`${new Date().getFullYear()}-${laichenBirthday}`)
                sendDailyMsg(token.access_token, laichenOpenId, leftDays, xianWeather, lcDate)

            })
            .catch(err => {
                console.log('sendMessage err==== ', err)
                clearInterval(cycle)
            })
    }
}, 1000 * 60)

app.listen(3000, () => console.log('服务器启动成功...'))