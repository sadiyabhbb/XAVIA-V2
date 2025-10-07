import axios from "axios";

const u = "http://65.109.80.126:20409/aryan/gemini";

const config = {
  name: "gemini",
  aliases: ["ai", "chat"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 3,
  description: "Ask Gemini AI - Talk with Gemini AI using Aryan's API",
  usage: "[your question]",
  category: "ai"
};

async function handleReply({ message }) {
  const p = message.body;
  if (!p) return;

  message.react("⏳");

  try {
    const r = await axios.get(`${u}?prompt=${encodeURIComponent(p)}`);
    const reply = r.data?.response;
    if (!reply) throw new Error("No response from Gemini API.");

    message.react("✅");

    message.reply(reply).then(d => {
      d.addReplyEvent({
        callback: handleReply,
        author: message.senderID
      });
    });
  } catch (e) {
    message.react("❌");
    message.reply("⚠ Gemini API er response dite somossa hocchhe.");
  }
}

async function onCall({ message, args }) {
  const p = args.join(" ");
  if (!p) return message.reply("❌ Please provide a question or prompt.");

  message.react("⏳");

  try {
    const r = await axios.get(`${u}?prompt=${encodeURIComponent(p)}`);
    const reply = r.data?.response;
    if (!reply) throw new Error("No response from Gemini API.");

    message.react("✅");

    message.reply(reply).then(d => {
      d.addReplyEvent({
        callback: handleReply,
        author: message.senderID
      });
    });
  } catch (e) {
    message.react("❌");
    message.reply("⚠ Gemini API theke response pawa jachchhe na.");
  }
}

export default {
  config,
  onCall
};
