
// 回复用户消息的模板
module.exports = options => {

    let replyMessage = `
        <xml>
          <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
          <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
          <CreateTime>${options.createTime}</CreateTime>
          <MsgType><![CDATA[${options.msgType}]]></MsgType>
    `

    if (options.msgType === 'text') {
        // 文本消息
        replyMessage += `<Content><![CDATA[${options.content}]]></Content>`

    } else if (options.msgType === 'image') {
        // 图片消息
        replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`

    } else if (options.msgType === 'voice') {
        // 语音消息
        replyMessage += `
            <Voice>
                <MediaId><![CDATA[${options.mediaId}]]></MediaId>
            </Voice>
        `
    } else if (options.msgType === 'video') {
        // 视频消息
        replyMessage += `
            <Video>
                <MediaId><![CDATA[${options.mediaId}]]></MediaId>
                <Title><![CDATA[${options.title}]]></Title>
                <Description><![CDATA[${options.description}]]></Description>
            </Video>
        `
    } else if (options.msgType === 'music') {
        // 音乐消息
        replyMessage += `
            <Music>
                <Title><![CDATA[${options.title}]]></Title>
                <Description><![CDATA[${options.description}]]></Description>
                <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
                <HQMusicUrl><![CDATA[${options.HQMusicUrl}]]></HQMusicUrl>
                <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
            </Music>
        `
    } else {
        // 图文消息 ...

    }

    replyMessage += '</xml>'
    return replyMessage
}
