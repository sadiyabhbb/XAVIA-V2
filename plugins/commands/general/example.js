import axios from "axios";

const config = {
    name: "examplecommand",
    aliases: ["example", "demo"],
    version: "0.0.1",
    credits: "ArYAN",
    permissions: [0, 1, 2],
    description: "Complete example command with all Xavia bot features",
    usage: "[text]",
    cooldowns: 5,
    category: "general",
    isHidden: false,
    isAbsolute: false,
    extra: {
        customData: "You can store any extra data here"
    }
}

const langData = {
    "en_US": {
        "aryan.welcome": "👋 Welcome {name}! This is an example command.",
        "aryan.chooseOption": "Please choose an option:\n1️⃣ Reply Example\n2️⃣ React Example\n3️⃣ Attachment Example\n4️⃣ API Example\n\nReply with number (1-4)",
        "aryan.invalidChoice": "❌ Invalid choice! Please reply with 1, 2, 3, or 4",
        "aryan.replySuccess": "✅ You replied: {text}",
        "aryan.reactSuccess": "✅ You reacted with: {emoji}",
        "aryan.waitingReply": "💬 Waiting for your reply...",
        "aryan.waitingReact": "😊 React to this message with any emoji!",
        "aryan.timeout": "⏱️ Time's up! Please try again.",
        "aryan.error": "❌ Error: {error}",
        "aryan.noData": "❌ Your data is not ready"
    },
    "vi_VN": {
        "aryan.welcome": "👋 Chào mừng {name}! Đây là lệnh ví dụ.",
        "aryan.chooseOption": "Vui lòng chọn:\n1️⃣ Ví dụ Reply\n2️⃣ Ví dụ React\n3️⃣ Ví dụ Attachment\n4️⃣ Ví dụ API\n\nTrả lời bằng số (1-4)",
        "aryan.invalidChoice": "❌ Lựa chọn không hợp lệ! Vui lòng trả lời 1, 2, 3 hoặc 4",
        "aryan.replySuccess": "✅ Bạn đã trả lời: {text}",
        "aryan.reactSuccess": "✅ Bạn đã react: {emoji}",
        "aryan.waitingReply": "💬 Đang đợi phản hồi...",
        "aryan.waitingReact": "😊 Hãy react tin nhắn này!",
        "aryan.timeout": "⏱️ Hết giờ! Vui lòng thử lại.",
        "aryan.error": "❌ Lỗi: {error}",
        "aryan.noData": "❌ Dữ liệu của bạn chưa sẵn sàng"
    },
    "ar_SY": {
        "aryan.welcome": "👋 مرحبا {name}! هذا مثال على الأمر.",
        "aryan.chooseOption": "الرجاء اختيار خيار:\n1️⃣ مثال الرد\n2️⃣ مثال التفاعل\n3️⃣ مثال المرفق\n4️⃣ مثال API\n\nالرد برقم (1-4)",
        "aryan.invalidChoice": "❌ اختيار غير صالح! يرجى الرد 1، 2، 3 أو 4",
        "aryan.replySuccess": "✅ لقد رددت: {text}",
        "aryan.reactSuccess": "✅ لقد تفاعلت مع: {emoji}",
        "aryan.waitingReply": "💬 في انتظار ردك...",
        "aryan.waitingReact": "😊 تفاعل مع هذه الرسالة!",
        "aryan.timeout": "⏱️ انتهى الوقت! حاول مرة أخرى.",
        "aryan.error": "❌ خطأ: {error}",
        "aryan.noData": "❌ بياناتك ليست جاهزة"
    }
}

function onLoad() {
    console.log(`[${config.name}] Command loaded successfully!`);
    global.exampleData = "This runs once when bot starts";
}

async function handleReplyExample({ message, getLang, eventData, data }) {
    const { body, senderID } = message;
    const { choice } = eventData;

    if (choice === "menu") {
        const userChoice = body.trim();

        if (userChoice === "1") {
            message.reply(getLang("aryan.waitingReply")).then(d => {
                d.addReplyEvent({
                    callback: handleReplyExample,
                    choice: "reply",
                    author: senderID,
                    author_only: true
                }, 60000);
            });
        } else if (userChoice === "2") {
            message.reply(getLang("aryan.waitingReact")).then(d => {
                d.addReactEvent({
                    callback: handleReactExample,
                    choice: "react",
                    author: senderID,
                    author_only: true
                }, 60000);
            });
        } else if (userChoice === "3") {
            showAttachmentExample(message, getLang);
        } else if (userChoice === "4") {
            showAPIExample(message, getLang);
        } else {
            message.reply(getLang("aryan.invalidChoice"));
        }
    } else if (choice === "reply") {
        message.reply(getLang("aryan.replySuccess", { text: body }));
    }
}

async function handleReactExample({ message, getLang, eventData }) {
    const { reaction } = message;
    message.send(getLang("aryan.reactSuccess", { emoji: reaction }));
}

async function showAttachmentExample(message, getLang) {
    try {
        const imageUrl = "https://i.imgur.com/L2OsbcZ.gif";
        const imageStream = (await axios.get(imageUrl, { responseType: "stream" })).data;
        
        message.reply({
            body: "📎 This is an attachment example!\nImage from URL loaded successfully.",
            attachment: imageStream
        });
    } catch (error) {
        message.reply(getLang("aryan.error", { error: error.message }));
    }
}

async function showAPIExample(message, getLang) {
    try {
        const response = await axios.get("https://api.github.com/users/github");
        const userData = response.data;
        
        message.reply(
            `🌐 API Example (GitHub User):\n` +
            `Name: ${userData.name}\n` +
            `Username: ${userData.login}\n` +
            `Followers: ${userData.followers}\n` +
            `Public Repos: ${userData.public_repos}`
        );
    } catch (error) {
        message.reply(getLang("aryan.error", { error: error.message }));
    }
}

async function onCall({ message, args, getLang, data, extra, prefix, userPermissions }) {
    const { Users, Threads } = global.controllers;
    const { senderID, threadID, isGroup } = message;

    const userName = data?.user?.info?.name || senderID;
    
    if (!data?.user) {
        return message.reply(getLang("aryan.noData"));
    }

    if (!args[0]) {
        message.reply(getLang("aryan.welcome", { name: userName }));
        
        message.reply(getLang("aryan.chooseOption")).then(d => {
            d.addReplyEvent({
                callback: handleReplyExample,
                choice: "menu",
                author: senderID,
                author_only: true,
                name: config.name
            }, 60000);
        });
    } else {
        const text = args.join(" ");
        message.reply(`You said: ${text}`);
    }
}

export default {
    config,
    langData,
    onLoad,
    onCall
}
