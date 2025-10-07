import axios from "axios";
import { writeFileSync, createReadStream, unlinkSync } from "fs";
import { join } from "path";
import ytSearch from "yt-search";

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 5,
  description: "Search and download music from YouTube",
  usage: "<song name or YouTube URL>",
  category: "media"
};

async function onCall({ message, args }) {
  if (!args.length) return message.reply("❌ Provide a song name or YouTube URL.");

  let h = args.join(" ");
  const msg = await message.send("🎵 Please wait...");

  try {
    let j;
    if (h.startsWith("http")) {
      j = h;
    } else {
      const k = await ytSearch(h);
      if (!k || !k.videos.length) throw new Error("No results found.");
      j = k.videos[0].url;
    }

    const l = `http://65.109.80.126:20409/aryan/play?url=${encodeURIComponent(j)}`;
    const m = await axios.get(l);
    const n = m.data;

    if (!n.status || !n.downloadUrl) throw new Error("API failed to return download URL.");

    const o = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, "");
    const p = join(global.cachePath, o);

    const q = await axios.get(n.downloadUrl, { responseType: "arraybuffer" });
    writeFileSync(p, q.data);

    await message.reply({
      attachment: createReadStream(p),
      body: `🎵 𝗠𝗨𝗦𝗜𝗖\n━━━━━━━━━━━━━━━\n\n${n.title}`
    }).then(() => {
      unlinkSync(p);
      message.unsend(msg.messageID);
    });
  } catch (r) {
    console.error(r);
    message.reply(`❌ Failed to download song: ${r.message}`);
    message.unsend(msg.messageID);
  }
}

export default {
  config,
  onCall
};
