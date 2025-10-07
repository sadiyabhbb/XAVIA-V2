import axios from "axios";

const config = {
  name: "imgur",
  version: "1.0.0",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 0,
  description: "Upload an image/video to Imgur",
  usage: "reply to an image/video or provide a URL",
  category: "utility"
};

async function onCall({ message, args }) {
  let mediaUrl = "";

  if (message.type === "message_reply" && message.messageReply?.attachments?.length > 0) {
    mediaUrl = message.messageReply.attachments[0].url;
  } else if (args.length > 0) {
    mediaUrl = args.join(" ");
  }

  if (!mediaUrl) {
    return message.reply("❌ Please reply to an image/video or provide a URL!");
  }

  try {
    message.react("⏳");

    const res = await axios.get(`http://65.109.80.126:20409/aryan/imgur?url=${encodeURIComponent(mediaUrl)}`);
    const imgurLink = res.data.imgur;

    if (!imgurLink) {
      message.react("");
      return message.reply("❌ Failed to upload to Imgur.");
    }

    message.react("✅");
    return message.reply(`${imgurLink}`);
  } catch (err) {
    console.error("Imgur upload error:", err);
    message.react("");
    return message.reply("⚠️ An error occurred while uploading.");
  }
}

export default {
  config,
  onCall
};
