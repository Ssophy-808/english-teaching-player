(function () {
  "use strict";

  const vocabulary = (word, meaning, visual, aliases = []) => ({
    word,
    meaning,
    visual,
    aliases,
    image: "",
    audio: ""
  });

  const makeUnit = (id, title, topic, words, phonicsGroups, sentenceGroups, grammarFocus) => {
    const passportSentences = sentenceGroups.flat();
    return {
      id,
      title,
      topic,
      vocabulary: words.map(([word, meaning, visual, aliases]) => vocabulary(word, meaning, visual, aliases || [])),
      mainSentences: passportSentences.map(([sentence]) => sentence),
      passportSentences,
      grammarFocus,
      phonics: { groups: phonicsGroups.map(([family, items]) => ({ family, words: items })) },
      materials: { wordwallDay1Url: "", wordwallDay2Url: "", bookUrl: "" }
    };
  };

  const units = [
    {
      id: "unit-1",
      title: "What do you like?",
      topic: "Animals We Like",
      vocabulary: [
        vocabulary("birds", "鳥", "🐦", ["bird"]),
        vocabulary("frogs", "青蛙", "🐸", ["frog"]),
        vocabulary("puppies", "小狗", "🐶", ["puppy"]),
        vocabulary("fish", "魚", "🐟"),
        vocabulary("bunnies", "兔子", "🐰", ["bunny"]),
        vocabulary("turtles", "烏龜", "🐢", ["turtle"]),
        vocabulary("hamsters", "倉鼠", "🐹", ["hamster"]),
        vocabulary("spiders", "蜘蛛", "🕷️", ["spider"])
      ],
      mainSentences: [
        "I like birds.",
        "You like frogs.",
        "We like puppies.",
        "They like fish.",
        "What do you like? I like bunnies.",
        "What do they like? They like turtles.",
        "Do you like hamsters? Yes, I do.",
        "Do they like spiders? Yes, they do."
      ],
      passportSentences: [
        ["I like birds.", "我喜歡鳥。"],
        ["You like frogs.", "你喜歡青蛙。"],
        ["We like puppies.", "我們喜歡小狗。"],
        ["They like fish.", "他們喜歡魚。"],
        ["What do you like?", "你喜歡什麼？"],
        ["I like bunnies.", "我喜歡兔子。"],
        ["What do they like?", "他們喜歡什麼？"],
        ["They like turtles.", "他們喜歡烏龜。"],
        ["Do you like hamsters?", "你喜歡倉鼠嗎？"],
        ["Yes, I do.", "是的，我喜歡。"],
        ["Do they like spiders?", "他們喜歡蜘蛛嗎？"],
        ["Yes, they do.", "是的，他們喜歡。"]
      ],
      phonics: {
        groups: [
          { family: "-ai-", words: ["rain", "train"] },
          { family: "-ay", words: ["day", "play"] },
          { family: "-eigh-", words: ["eight", "weight"] }
        ]
      },
      materials: { wordwallDay1Url: "", wordwallDay2Url: "", bookUrl: "" }
    },
    makeUnit("unit-2", "Does Lumi like pizza?", "Fast Food", [
      ["hamburger", "漢堡", "🍔"], ["french fries", "薯條", "🍟"], ["chicken nuggets", "雞塊", "🍗"],
      ["onion rings", "洋蔥圈", "🧅"], ["fried chicken", "炸雞", "🍗"], ["salad", "沙拉", "🥗"],
      ["hot dog", "熱狗", "🌭"], ["soda", "汽水", "🥤"], ["cola", "可樂", "🥤"], ["pizza", "披薩", "🍕"]
    ], [["-ea-", ["leaf", "mean"]], ["-ee-", ["bee", "reed"]], ["-ey", ["honey", "key"]], ["-ie-", ["field", "thief"]]], [
      [["Does Lumi like pizza?", "Lumi 喜歡披薩嗎？"], ["No, she doesn't.", "不，她不喜歡。"]],
      [["She likes hamburgers.", "她喜歡漢堡。"]],
      [["He likes hot dogs.", "他喜歡熱狗。"], ["She doesn't like onion rings.", "她不喜歡洋蔥圈。"]],
      [["What does she like?", "她喜歡什麼？"], ["She likes soda.", "她喜歡汽水。"]],
      [["Does he like pizza?", "他喜歡披薩嗎？"], ["Yes, he does.", "是的，他喜歡。"]],
      [["Does your mom like pizza?", "你媽媽喜歡披薩嗎？"], ["Yes, she does.", "是的，她喜歡。"]]
    ], "he / she / name + likes; does + like"),
    makeUnit("unit-3", "Do you want some milk?", "Food and Drinks", [
      ["milk", "牛奶", "🥛"], ["bread", "麵包", "🍞"], ["cake", "蛋糕", "🍰"], ["popcorn", "爆米花", "🍿"],
      ["cookies", "餅乾", "🍪"], ["ice cream", "冰淇淋", "🍨"], ["juice", "果汁", "🧃"],
      ["potato chips", "洋芋片", "🥔"], ["tea", "茶", "🍵"], ["coffee", "咖啡", "☕"]
    ], [["-ai-", ["mail", "rain"]], ["-ay", ["day", "pay"]], ["-ea-", ["leaf", "mean"]], ["-ee-", ["bee", "reed"]]], [
      [["I want some juice.", "我想要一些果汁。"], ["She wants some ice cream.", "她想要一些冰淇淋。"]],
      [["Do you want some milk?", "你想要一些牛奶嗎？"], ["No, I don't want any milk.", "不，我不想要牛奶。"]],
      [["I want some cookies.", "我想要一些餅乾。"], ["They don't want any ice cream.", "他們不想要冰淇淋。"]],
      [["He wants some milk.", "他想要一些牛奶。"], ["She doesn't want any popcorn.", "她不想要爆米花。"]],
      [["Does he want some bread?", "他想要一些麵包嗎？"], ["No, he doesn't.", "不，他不想要。"]],
      [["Who wants ice cream?", "誰想要冰淇淋？"], ["I want some ice cream, please.", "請給我一些冰淇淋。"]]
    ], "want some; don't want any; wants / doesn't want"),
    makeUnit("unit-4", "What does he want?", "Toys and Wishes", [
      ["skateboard", "滑板", "🛹"], ["action figure", "人偶玩具", "🦸"], ["puzzle", "拼圖", "🧩"],
      ["computer", "電腦", "💻"], ["kite", "風箏", "🪁"], ["stuffed animal", "絨毛玩具", "🧸"],
      ["jump rope", "跳繩", "➰"], ["model car", "模型車", "🏎️"], ["bicycle", "自行車", "🚲"]
    ], [["-ie", ["die", "lie", "pie", "tie"]], ["-igh-", ["light", "night", "sight", "tight"]]], [
      [["What does he want?", "他想要什麼？"], ["He wants a new computer.", "他想要一台新電腦。"]],
      [["What do you want?", "你想要什麼？"], ["I want a kite.", "我想要一個風箏。"]],
      [["What does she want?", "她想要什麼？"], ["She wants a bicycle.", "她想要一輛自行車。"]],
      [["What does Ludi want for his birthday?", "Ludi 生日想要什麼？"], ["He wants a computer.", "他想要一台電腦。"]],
      [["Does he want a bicycle?", "他想要一輛自行車嗎？"], ["No, he doesn't.", "不，他不想要。"]]
    ], "what does + subject + want; subject + wants"),
    makeUnit("unit-5", "Who has a small mouth?", "Body Parts", [
      ["head", "頭", "🧑"], ["eye(s)", "眼睛", "👁️"], ["ear(s)", "耳朵", "👂"], ["nose", "鼻子", "👃"],
      ["leg(s)", "腿", "🦵"], ["hand(s)", "手", "✋"], ["arm(s)", "手臂", "💪"],
      ["tooth / teeth", "牙齒", "🦷"], ["mouth", "嘴巴", "👄"], ["foot / feet", "腳", "🦶"]
    ], [["-oa-", ["boat", "road", "soap"]], ["-oe", ["doe", "hoe", "toe"]], ["-ow-", ["bowl", "low", "row"]]], [
      [["I have two noses.", "我有兩個鼻子。"], ["He has three eyes.", "他有三隻眼睛。"]],
      [["I have a big nose.", "我有一個大鼻子。"], ["They don't have two small eyes.", "他們沒有兩隻小眼睛。"]],
      [["She has two big ears.", "她有兩隻大耳朵。"], ["He doesn't have white teeth.", "他沒有白色的牙齒。"]],
      [["Who has a small mouth?", "誰有一張小嘴巴？"], ["I have a small mouth.", "我有一張小嘴巴。"]],
      [["Ludi has a big mouth and two big eyes.", "Ludi 有一張大嘴巴和兩隻大眼睛。"]]
    ], "I / you / we / they have; he / she has"),
    makeUnit("unit-6", "Do you have long hair?", "Hair", [
      ["hair", "頭髮", "💇"], ["long", "長的", "📏"], ["short", "短的", "✂️"], ["curly", "捲的", "〰️"],
      ["straight", "直的", "➖"], ["braided", "編辮子的", "🪢"], ["blond", "金髮的", "👱"], ["dark", "深色的", "🖤"]
    ], [["Long i", ["pie", "light", "night"]], ["Long o", ["boat", "road", "row"]]], [
      [["Do you have long hair?", "你有長頭髮嗎？"], ["Yes, I do.", "是的，我有。"]],
      [["I have long hair.", "我有長頭髮。"], ["We have short hair.", "我們有短頭髮。"]],
      [["Does he have short curly hair?", "他有短捲髮嗎？"], ["Yes, he does.", "是的，他有。"]],
      [["I want to cut my hair short.", "我想把頭髮剪短。"]],
      [["I want to keep it long and braid it.", "我想留長並編成辮子。"]]
    ], "do + have; does + have (not has)"),
    makeUnit("unit-7", "Do you like to play baseball?", "Sports", [
      ["basketball", "籃球", "🏀"], ["ping-pong", "乒乓球", "🏓"], ["volleyball", "排球", "🏐"], ["golf", "高爾夫球", "⛳"],
      ["soccer", "足球", "⚽"], ["badminton", "羽毛球", "🏸"], ["football", "美式足球", "🏈"],
      ["dodgeball", "躲避球", "🔴"], ["tennis", "網球", "🎾"], ["baseball", "棒球", "⚾"]
    ], [["-ue-", ["due", "fuel", "Sue"]], ["-ui-", ["fruit", "juice", "suit"]], ["-ew", ["dew", "few", "new"]]], [
      [["Do you like to play baseball?", "你喜歡打棒球嗎？"], ["Yes, I do.", "是的，我喜歡。"]],
      [["I like to play baseball.", "我喜歡打棒球。"]],
      [["Does Mommy like to play baseball?", "媽媽喜歡打棒球嗎？"], ["No, she doesn't.", "不，她不喜歡。"]],
      [["She likes to play badminton.", "她喜歡打羽毛球。"]],
      [["What sports do you like to play?", "你喜歡做什麼運動？"], ["I like to play tennis.", "我喜歡打網球。"]]
    ], "like / likes + to play + sport"),
    makeUnit("unit-8", "What day is today?", "Days and Activities", [
      ["fly a kite", "放風箏", "🪁"], ["read a book", "看書", "📖"], ["listen to music", "聽音樂", "🎧"],
      ["watch TV", "看電視", "📺"], ["ride a bike", "騎腳踏車", "🚲"], ["Sunday", "星期日", "☀️"],
      ["Monday", "星期一", "1️⃣"], ["Tuesday", "星期二", "2️⃣"], ["Wednesday", "星期三", "3️⃣"],
      ["Thursday", "星期四", "4️⃣"], ["Friday", "星期五", "5️⃣"], ["Saturday", "星期六", "6️⃣"]
    ], [["Long a", ["cake", "rain"]], ["Long e", ["leaf", "bee"]], ["Long i", ["pie", "light"]], ["Long o", ["boat", "row"]]], [
      [["What day is today?", "今天星期幾？"], ["It's Saturday.", "今天是星期六。"]],
      [["I like to watch TV on Mondays.", "我喜歡星期一看電視。"]],
      [["He doesn't like to watch TV on Sundays.", "他不喜歡星期日看電視。"]],
      [["Do you like to watch TV on Fridays?", "你們喜歡星期五看電視嗎？"], ["Yes, we do.", "是的，我們喜歡。"]],
      [["What day is tomorrow?", "明天星期幾？"], ["Tomorrow is Sunday.", "明天是星期日。"]],
      [["What do you like to do on Sundays?", "你星期日喜歡做什麼？"], ["I like to fly a kite.", "我喜歡放風箏。"]]
    ], "on + plural day; like / likes to + activity"),
    makeUnit("unit-9", "How's the weather today?", "Weather and Activities", [
      ["sunny", "晴朗的", "☀️"], ["rainy", "下雨的", "🌧️"], ["snowy", "下雪的", "🌨️"], ["windy", "有風的", "💨"],
      ["cloudy", "多雲的", "☁️"], ["go swimming", "去游泳", "🏊"], ["go shopping", "去購物", "🛍️"],
      ["go fishing", "去釣魚", "🎣"], ["go jogging", "去慢跑", "🏃"], ["go hiking", "去健行", "🥾"]
    ], [["Long a", ["cake", "rain"]], ["Long e", ["leaf", "bee"]], ["Long i", ["pie", "light"]], ["Long o", ["boat", "row"]], ["Long u", ["due", "new"]]], [
      [["How's the weather today?", "今天天氣如何？"], ["It's sunny.", "今天是晴天。"]],
      [["What do you like to do on sunny days?", "你喜歡在晴天做什麼？"], ["I like to go fishing.", "我喜歡去釣魚。"]],
      [["What's the weather like in your city?", "你的城市天氣如何？"], ["It's cloudy today.", "今天是多雲。"]],
      [["What does he like to do on windy days?", "他喜歡在有風的日子做什麼？"], ["He likes to go fishing.", "他喜歡去釣魚。"]],
      [["Does Lumi like to go hiking?", "Lumi 喜歡去健行嗎？"], ["No, she doesn't.", "不，她不喜歡。"]]
    ], "weather questions; like / likes to go + V-ing")
  ];

  window.CURRICULUM_BOOKS.push({
    id: "book-3",
    title: "Book 3",
    subtitle: "Growing Skills",
    units
  });
})();
