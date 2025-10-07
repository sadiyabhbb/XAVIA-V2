import axios from "axios";
import { writeFileSync, createReadStream, unlinkSync } from "fs";
import { join } from "path";

const config = {
  name: "tiktok",
  aliases: ["tik"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 5,
  description: "Search and download TikTok videos",
  usage: "<keyword>",
  category: "media"
};

async function handleReply({ message, eventData }) {
  const { results, messageID } = eventData;
  const v = parseInt(message.body);

  if (isNaN(v) || v < 1 || v > results.length) {
    return message.reply("❌ Invalid choice. Please reply with a number between 1 and 15.");
  }

  const w = results[v - 1];
  const x = join(global.cachePath, `tiktok_${Date.now()}.mp4`);

  try {
    const y = await axios.get(w.video, { responseType: "arraybuffer" });
    writeFileSync(x, Buffer.from(y.data));

    await message.unsend(messageID);

    message.reply({
      body: `🎬 ${w.title}`,
      attachment: createReadStream(x)
    }).then(() => unlinkSync(x));
  } catch (z) {
    console.error(z);
    return message.reply("❌ Failed to download video.");
  }
}

async function onCall({ message, args }) {
  if (!args[0]) return message.reply("❌ Please provide a search keyword.");

  const g = args.join(" ");
  const h = `http://65.109.80.126:20409/aryan/tsearchv2?search=${encodeURIComponent(g)}&count=20`;

  try {
    const { data: i } = await axios.get(h);
    if (!i.status || !i.data || i.data.length === 0) {
      return message.reply("❌ No results found.");
    }

    const j = i.data.slice(0, 15);

    let k = "🕹️ TikTok\n\n";
    j.forEach((l, m) => {
      k += `${m + 1}• ${l.title}\n`;
    });

    message.reply(k + "\nReply with a number 1-15").then(d => {
      d.addReplyEvent({
        callback: handleReply,
        results: j,
        messageID: d.messageID,
        author: message.senderID,
        author_only: true
      });
    });
  } catch (p) {
    console.error(p);
    return message.reply("❌ Failed to search TikTok.");
  }
}

export default {
  config,
  onCall
};
