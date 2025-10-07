import axios from "axios";

const config = {
  name: "flux",
  aliases: [],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 5,
  description: "Generate image using Flux AI",
  usage: "[prompt text]",
  category: "ai"
};

async function onCall({ message, args }) {
  const p = args.join(" ");
  if (!p) {
    return message.reply("❌ Please provide a prompt.\nExample: flux cyberpunk city");
  }

  message.react("⏳");

  const u = `http://65.109.80.126:20409/aryan/flux?prompt=${encodeURIComponent(p)}`;

  try {
    const r = await axios.get(u, { responseType: 'stream' });

    await message.reply({
      body: `✅ Here is your Flux AI image!\n\n📝 Prompt: ${p}`,
      attachment: r.data
    });

    message.react("✅");
  } catch (e) {
    console.error("Flux API Error:", e.message || e);
    message.react("❌");
    message.reply("⚠ Flux API theke image generate kora jacchhe na.");
  }
}

export default {
  config,
  onCall
};
