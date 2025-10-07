import axios from "axios";
import { createWriteStream, createReadStream, unlinkSync } from "fs";
import { join } from "path";

const aryan = "https://nix-album-api.vercel.app";
const nix = "http://65.109.80.126:20409/aryan/imgur";

const config = {
  name: "album",
  version: "0.0.1",
  permissions: [0],
  credits: "ArYAN",
  description: "Album video manager - add and browse videos by category",
  usage: "[page] | add [category] [url] | list",
  category: "media"
};

async function handleReply({ message, eventData }) {
  const { realCategories, captions } = eventData;
  const reply = parseInt(message.body);
  const index = reply - 1;

  if (isNaN(reply) || index < 0 || index >= realCategories.length) {
    return message.reply("Please reply with a valid number from the list.");
  }

  const category = realCategories[index];
  const caption = captions[index];

  try {
    const response = await axios.get(`${aryan}/api/album/videos/${category}`);

    if (!response.data.success) {
      return message.reply(response.data.message);
    }

    const videoUrls = response.data.videos;
    if (!videoUrls || videoUrls.length === 0) {
      return message.reply("[⚜️]➜ 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.");
    }

    const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const filePath = join(global.cachePath, `album_${Date.now()}.mp4`);

    const videoStream = (await axios.get(randomVideoUrl, { responseType: "stream" })).data;
    const writer = createWriteStream(filePath);
    
    videoStream.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    message.reply({
      body: caption,
      attachment: createReadStream(filePath)
    }).then(() => unlinkSync(filePath));

  } catch (error) {
    console.error(error);
    message.reply("[⚜️]➜ 𝐄𝐫𝐫𝐨𝐫 𝐰𝐡𝐢𝐥𝐞 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨.");
  }
}

async function onCall({ message, args }) {
  if (args[0] === "add") {
    if (!args[1]) {
      return message.reply("[⚜️]➜ Please specify a category. Usage: album add [category] [video_url] or reply to a video.");
    }

    const category = args[1].toLowerCase();
    let videoUrl = args[2];

    if (message.type === "message_reply" && message.messageReply?.attachments?.[0]?.type === "video") {
      videoUrl = message.messageReply.attachments[0].url;
    }

    if (!videoUrl) {
      return message.reply("[⚜️]➜ Please provide a video URL or reply to a video message.");
    }

    try {
      const imgurResponse = await axios.get(nix, {
        params: { url: videoUrl }
      });

      if (!imgurResponse.data || !imgurResponse.data.imgur) {
        throw new Error("Imgur upload failed.");
      }

      const imgurLink = imgurResponse.data.imgur;
      const addResponse = await axios.post(`${aryan}/api/album/add`, {
        category,
        videoUrl: imgurLink
      });

      return message.reply(addResponse.data.message);
    } catch (error) {
      console.error(error);
      return message.reply(`[⚜️]➜ Failed to add video.\nError: ${error.response?.data?.error || error.message}`);
    }
  }

  if (args[0] === "list") {
    try {
      const response = await axios.get(`${aryan}/api/category/list`);
      if (response.data.success) {
        const categories = response.data.categories.map((cat, index) => `${index + 1}. ${cat}`).join("\n");
        return message.reply(`𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n\n${categories}`);
      } else {
        return message.reply(`[⚜️]➜ Failed to fetch categories.\nError: ${response.data.error}`);
      }
    } catch (error) {
      return message.reply(`[⚜️]➜ Error while fetching categories.`);
    }
  }

  const categoriesInJson = ["funny", "islamic", "sad", "anime", "lofi", "attitude", "ff", "love", "horny", "baby","romantic","cartoon","pubg","emotional","meme","song","friend","trending","hinata","gojo","car","cat","random","game","asif","azhari","girl","travel","food","nature","tiktok","naruto","phone","editing","neymar","messi","ronaldo","football","hindi","18+"];
  const displayNames = ["𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐟 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐡𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐛𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨","𝐫𝐨𝐦𝐚𝐧𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨","𝐜𝐚𝐫𝐭𝐨𝐨𝐧 𝐕𝐢𝐝𝐞𝐨","𝐩𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨","𝐞𝐦𝐨𝐭𝐢𝐨𝐧𝐚𝐥 𝐕𝐢𝐝𝐞𝐨","𝐦𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨","𝐬𝐨𝐧𝐠 𝐕𝐢𝐝𝐞𝐨","𝐟𝐫𝐢𝐞𝐧𝐝 𝐕𝐢𝐝𝐞𝐨","𝐭𝐫𝐞𝐧𝐝𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨","𝐡𝐢𝐧𝐚𝐭𝐚 𝐕𝐢𝐝𝐞𝐨","𝐠𝐨𝐣𝐨 𝐕𝐢𝐝𝐞𝐨","𝐜𝐚𝐫 𝐕𝐢𝐝𝐞𝐨","𝐜𝐚𝐭 𝐕𝐢𝐝𝐞𝐨","𝐫𝐚𝐧𝐝𝐨𝐦 𝐕𝐢𝐝𝐞𝐨","𝐠𝐚𝐦𝐞 𝐕𝐢𝐝𝐞𝐨","𝐚𝐬𝐢𝐟 𝐡𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨","𝐚𝐳𝐡𝐚𝐫𝐢 𝐡𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨","𝐠𝐢𝐫𝐥 𝐕𝐢𝐝𝐞𝐨","𝐭𝐫𝐚𝐯𝐞𝐥 𝐕𝐢𝐝𝐞𝐨","𝐟𝐨𝐨𝐝 𝐕𝐢𝐝𝐞𝐨","𝐧𝐚𝐭𝐮𝐫𝐞 𝐕𝐢𝐝𝐞𝐨","𝐭𝐢𝐤𝐭𝐨𝐤 𝐕𝐢𝐝𝐞𝐨","𝐧𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨","𝐩𝐡𝐨𝐧𝐞 𝐕𝐢𝐝𝐞𝐨","𝐞𝐝𝐢𝐭𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨","𝐍𝐞𝐲𝐦𝐚𝐫 𝐕𝐢𝐝𝐞𝐨","𝐌𝐞𝐬𝐬𝐢 𝐕𝐢𝐝𝐞𝐨","𝐑𝐨𝐧𝐚𝐥𝐝𝐨 𝐕𝐢𝐝𝐞𝐨","𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨","𝐡𝐢𝐧𝐝𝐢 𝐕𝐢𝐝𝐞𝐨","18+ 𝐕𝐢𝐝𝐞𝐨"];
  
  const itemsPerPage = 10;
  const page = parseInt(args[0]) || 1;
  const totalPages = Math.ceil(displayNames.length / itemsPerPage);

  if (page < 1 || page > totalPages) {
    return message.reply(`[⚜️]➜ Invalid page! Please choose between 1 - ${totalPages}.`);
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedCategories = displayNames.slice(startIndex, endIndex);

  const messageText =
    `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 𝐋𝐢𝐬𝐭 🎀\n` +
    "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n" +
    displayedCategories.map((option, index) => `${startIndex + index + 1}. ${option}`).join("\n") +
    "\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩" +
    `\n♻ | 𝐏𝐚𝐠𝐞 [${page}/${totalPages}]` +
    (page < totalPages ? `\nℹ | 𝐓𝐲𝐩𝐞 !album ${page + 1} - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.` : "");

  const captions = [
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😺",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <✨",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😢",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎶",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <☠️ ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐟 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎮 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💖 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐡𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐛𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥰 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐫𝐨𝐦𝐚𝐧𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😍",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐜𝐚𝐫𝐭𝐨𝐨𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🙅",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐩𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎮",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐞𝐦𝐨𝐭𝐢𝐨𝐧𝐚𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😌",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐦𝐞𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎧 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐟𝐫𝐢𝐞𝐧𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👭",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐭𝐫𝐞𝐧𝐝𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎯",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐡𝐢𝐧𝐚𝐭𝐚 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🧑‍🦰",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐠𝐨𝐣𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🧔 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐜𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🚗",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐜𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐈",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌎",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐠𝐚𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎮",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐚𝐬𝐢𝐟 𝐡𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🧑‍🚀",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐚𝐳𝐡𝐚𝐫𝐢 𝐡𝐮𝐣𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👳 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐠𝐢𝐫𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💃",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐭𝐫𝐚𝐯𝐞𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👌 ",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐟𝐨𝐨𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🍔",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐧𝐚𝐭𝐮𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <❤️",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐭𝐢𝐤𝐭𝐨𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐧𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🙋",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐩𝐡𝐨𝐧𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <📱",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐞𝐝𝐢𝐭𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💻",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐍𝐞𝐲𝐦𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐞𝐬𝐬𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐑𝐨𝐧𝐚𝐥𝐝𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐡𝐢𝐧𝐝𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🫂",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 18+ 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🔥"
  ];

  message.reply(messageText).then(d => {
    d.addReplyEvent({
      callback: handleReply,
      realCategories: categoriesInJson,
      captions: captions,
      author: message.senderID,
      author_only: true
    });
  });
}

export default {
  config,
  onCall
};
