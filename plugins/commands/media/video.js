import fetch from "node-fetch";
import axios from "axios";
import { writeFileSync, createReadStream, unlinkSync } from "fs";
import { join } from "path";
import ytSearch from "yt-search";

const config = {
  name: "video",
  aliases: ["v"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 5,
  description: "Search and download YouTube video",
  usage: "[video name]",
  category: "media"
};

async function onCall({ message, args }) {
  if (!args.length) return message.reply("Please provide a video name.");

  const aryan = args.join(" ");
  const msg = await message.send("🎧 Please wait...");

  try {
    const r = await ytSearch(aryan);
    if (!r || !r.videos.length) throw new Error("No video found.");

    const v = r.videos[0];
    const u = v.url;

    const link = `http://65.109.80.126:20409/aryan/ytbv3?url=${encodeURIComponent(u)}&format=mp4`;

    message.react("⌛");

    const dl = await axios.get(link);
    const dlUrl = dl.data.download;

    const res = await fetch(dlUrl);
    if (!res.ok) throw new Error(`Failed to fetch video. Status code: ${res.status}`);

    const file = `${v.title}.mp4`;
    const save = join(global.cachePath, file);

    const buff = await res.buffer();
    writeFileSync(save, buff);

    message.react("✅");

    const text = `📌 Title: ${v.title}\n👀 Views: ${v.views}`;

    await message.reply({
      attachment: createReadStream(save),
      body: text
    }).then(() => {
      unlinkSync(save);
      message.unsend(msg.messageID);
    });
  } catch (e) {
    console.error(`Failed to download video: ${e.message}`);
    message.reply(`Failed to download video: ${e.message}`);
  }
}

export default {
  config,
  onCall
};
