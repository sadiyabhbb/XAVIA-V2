import axios from "axios";

const config = {
  name: "prompt",
  aliases: ["p"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  description: "Image analysis with AI prompt",
  usage: "reply to an image with optional prompt",
  category: "ai"
};

async function onCall({ message, args }) {
  const u = "http://65.109.80.126:20409/aryan/prompt";
  const p = args.join(" ") || "Describe this image";

  if (message.type === "message_reply" && message.messageReply?.attachments?.[0]?.type === "photo") {
    try {
      const i = message.messageReply.attachments[0].url;

      const r = await axios.get(u, {
        params: { imageUrl: i, prompt: p }
      });

      const x = r.data.response || "No response";

      if (r.data.status === false) {
        return message.reply(`❌ API Error: ${r.data.message}`);
      }

      message.reply(x);
      return message.react("✅");
    } catch (e) {
      console.error("Local API call error:", e.message || e);
      message.reply("❌ An error occurred with your local API. Make sure your server is running.");
      return message.react("❌");
    }
  }

  message.reply("⚠️ Please reply with an image.");
}

export default {
  config,
  onCall
};
