const config = {
  name: "unsend",
  aliases: ["remove", "uns","unsent"],
  description: "Unsend bot's message",
  usage: "[reply]",
  cooldown: 3,
  permissions: [0, 1, 2],
  credits: "XaviaTeam"
}

const langData = {
  "vi_VN": {
    "notReply": "Bạn phải reply tin nhắn của bot",
    "notBotMessage": "Tin nhắn bạn reply không phải của bot",
    "error": "Đã có lỗi xảy ra"
  },
  "en_US": {
    "notReply": "You must reply to the bot's message",
    "notBotMessage": "The message you reply is not from the bot",
    "error": "An error has occurred"
  },
  "ar_SY": {
    "notReply": "يجب عليك الرد على رسالة الروبوت",
    "notBotMessage": "الرسالة التي ترد عليها ليست من الروبوت",
    "error": "حدث خطأ"
  }
}

async function onCall({ message, getLang }) {
  try {
    if (message.type != "message_reply") return message.reply(getLang("notReply"));
    if (message.messageReply?.senderID != global.botID) return message.reply(getLang("notBotMessage"));
    
    const targetMessageID = message.messageReply.messageID;
    await global.api.unsendMessage(targetMessageID);
  } catch (err) {
    message.reply(getLang("error"));
  }
}

export default {
  config,
  langData,
  onCall
}