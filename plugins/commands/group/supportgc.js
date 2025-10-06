const config = {
  name: "supportgc",
  aliases: ["join","rgc"],
  description: "Join the support server",
  usage: "",
  cooldown: 3,
  permissions: [0, 1, 2],
  isAbsolute: false,
  isHidden: false,
  credits: "ArYAN",
};

async function onCall({ message }) {
  try {
      const supportServerThreadID = ""; 

      if (!supportServerThreadID) {
          return message.reply("Support server thread ID is not configured.");
      }

      await global.api.addUserToGroup(message.senderID, supportServerThreadID);
    await message.react("✅");
      message.reply("You have been invited to the support group!\nPlease check the message request box or spam box.");
  } catch (error) {
      console.error("[Support Server Error]", error);
    await message.react("❌");
      message.reply("Oops failed! Maybe you are already in the group or not connected to me or maybe you blocked me.");
  }
}

export default {
  config,
  onCall
};
