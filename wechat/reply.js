// 处理用户发送的消息类型和内容，返回相应的内容
module.exports = formatResult => {

    const options = {
        toUserName: formatResult.FromUserName,
        fromUserName: formatResult.ToUserName,
        createTime: Date.now(),
        // msgType: formatResult.MsgType,
        msgType: 'text',
    }

    let content = ''
    if (formatResult.MsgType === 'text') {
        if (formatResult.Content == 1) {
            content = '1'
        } else if (formatResult.Content == 2) {
            content = '2'
        } else if (formatResult.Content.includes('我爱你')) {
            content = '我也爱你❤️'
        } else if (formatResult.Content.includes('我喜欢你')) {
            content = '我也喜欢你❤️'
        } else {
            content = formatResult.Content
        }
    } else if (formatResult.MsgType === 'image') {
        // 用户发送图片消息
        options.msgType = 'image'
        options.mediaId = formatResult.MediaId
    } else if (formatResult.MsgType === 'voice') {
        // 用户发送语音消息
        options.msgType = 'voice'
        options.mediaId = formatResult.MediaId
    } else if (formatResult.MsgType === 'event') {
        // 事件
        if (formatResult.Event === 'subscribe') {
            content = '谢谢你这么可爱还关注我~'
            // 通过扫带参数的二维码
            if (formatResult.EventKey) {
                content = '扫描带参数的二维码关注事件'
            }
        } else if (formatResult.Event === 'unsubscribe') {
            console.log('用户取消关注')
        } else if (formatResult.Event === 'SCAN') {
            content = '用户已经关注过，再扫描带参数的二维码关注事件'
        } else if (formatResult.Event === 'CLICK') {
            content = `点击了按钮: ${formatResult.EventKey}`
        }
    }

    options.content = content
    return options
}