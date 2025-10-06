import axios from "axios";

const config = {
  name: "ai",
  aliases: ["ask", "aria"],
  permissions: [0],
  usage: "[question]",
  cooldown: 10,
  description: "Interact with Aryan's AI",
  credits: "ArYAN"
};

async function onCall({ message: m, args: ar }) {
  const q = ar.join(" ");
  if (!q) return m.reply("❌ Please provide a question.");

  try {
    await m.react("⏳");

    const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/aria?prompt=${encodeURIComponent(q)}`);
    const answer = res.data?.response || "❌ No response received.";

    await m.react("✅");
    return m.reply(answer);
  } catch (e) {
    console.error("AI CMD ERROR:", e);
    await m.react("❌");
    return m.reply("❌ Something went wrong. Please try again later.");
  }
}

export default { config, onCall };
