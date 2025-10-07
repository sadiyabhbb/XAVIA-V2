import axios from "axios";

const islamicQuotes = [
  {
    caption: "আল্লাহ বলেন: তোমরা আমাকে স্মরণ কর, আমিও তোমাদের স্মরণ করব। 🤲\n- সূরা আল-বাকারা: ১৫২",
    image: "https://i.imgur.com/9xZJ8yK.jpg"
  },
  {
    caption: "নিশ্চয়ই আল্লাহর স্মরণে হৃদয় প্রশান্ত হয়। 💚\n- সূরা আর-রাদ: ২৮",
    image: "https://i.imgur.com/7vKxM3L.jpg"
  },
  {
    caption: "যে আল্লাহর উপর ভরসা করে, তার জন্য আল্লাহই যথেষ্ট। 🌙\n- সূরা আত-তালাক: ৩",
    image: "https://i.imgur.com/2QxN9mP.jpg"
  },
  {
    caption: "আর তোমার রবের কাছে ক্ষমা প্রার্থনা কর এবং তাঁর দিকে ফিরে আস। ☪️\n- সূরা হুদ: ৩",
    image: "https://i.imgur.com/8KjT5vR.jpg"
  },
  {
    caption: "সবর কর, নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন। 🕋\n- সূরা আল-বাকারা: ১৫৩",
    image: "https://i.imgur.com/5xNmK9L.jpg"
  },
  {
    caption: "আল্লাহ তোমাদের জন্য সহজ করতে চান, কঠিন করতে চান না। 🌟\n- সূরা আল-বাকারা: ১৮৫",
    image: "https://i.imgur.com/6yPqR8M.jpg"
  },
  {
    caption: "যে তাকওয়া অবলম্বন করে, আল্লাহ তার জন্য পথ করে দেন। 📿\n- সূরা আত-তালাক: ২",
    image: "https://i.imgur.com/3vLxN7K.jpg"
  },
  {
    caption: "আল্লাহর রহমত আল্লাহর ক্রোধের উপর প্রাধান্য রাখে। 🤍\n- হাদিস: বুখারী",
    image: "https://i.imgur.com/9mKpQ2L.jpg"
  },
  {
    caption: "যে ব্যক্তি আল্লাহর জন্য কিছু ত্যাগ করে, আল্লাহ তাকে তার চেয়ে উত্তম কিছু দান করেন। 🌙\n- হাদিস: আহমাদ",
    image: "https://i.imgur.com/4xTmP5N.jpg"
  },
  {
    caption: "আল্লাহুম্মা ইন্নাকা আফুউউন, তুহিব্বুল আফওয়া ফা'ফু আন্নি। 🤲\nহে আল্লাহ! আপনি ক্ষমাশীল, ক্ষমা ভালোবাসেন, আমাকে ক্ষমা করুন।",
    image: "https://i.imgur.com/7xQmR9K.jpg"
  }
];

const langData = {
  "en_US": {
    "prefix": "{botname} Prefix is: {prefix}"
  }
};

async function onCall({ message, getLang, data }) {
  const messageBody = message.body?.trim();
  const prefix = data?.thread?.data?.prefix || global.config.PREFIX;
  const prefixTriggers = ["prefix", "prefix?", "Prefix"];

  if (messageBody === prefix) {
    try {
      const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];
      
      const imageStream = (await axios.get(randomQuote.image, {
        responseType: "stream"
      })).data;

      await message.reply({
        body: randomQuote.caption,
        attachment: imageStream
      });
    } catch (error) {
      console.error("Error in showPrefix:", error);
      await message.reply("আসসালামু আলাইকুম 🌙");
    }
  } else if (prefixTriggers.includes(messageBody)) {
    const botName = global.config.NAME;
    const replyText = getLang("prefix", {
      prefix,
      botname: botName
    });
    await message.reply(replyText);
  }
}

export default {
  langData,
  onCall
};
