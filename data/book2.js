(function () {
  "use strict";

  const unit = (id, title, topic, vocabulary, mainSentences, phonics, passportSentences) => ({
    id, title, topic, vocabulary, mainSentences,
    phonics: { groups: phonics.map(([family, words]) => ({ family, words })) },
    passportSentences,
    materials: { wordwallDay1Url: "", wordwallDay2Url: "", bookUrl: "" }
  });

  const v = (word, meaning, image = "", visual = "", aliases = []) => ({ word, meaning, image, visual, aliases, audio: "" });

  const units = [
    unit(
      "unit-1", "Is there a door?", "Classroom Objects",
      [
        v("door", "門", "assets/images/book2/unit1/door.jpeg"),
        v("window", "窗戶", "assets/images/book2/unit1/window.jpeg"),
        v("television", "電視", "assets/images/book2/unit1/television.jpeg"),
        v("speaker", "喇叭", "assets/images/book2/unit1/speaker.jpeg"),
        v("whiteboard", "白板", "assets/images/book2/unit1/whiteboard.jpeg"),
        v("trash can", "垃圾桶", "assets/images/book2/unit1/trash-can.jpeg"),
        v("table", "桌子", "assets/images/book2/unit1/table.jpeg"),
        v("fan", "電風扇", "assets/images/book2/unit1/fan.jpeg"),
        v("telephone", "電話", "assets/images/book2/unit1/telephone.jpeg"),
        v("blackboard", "黑板", "assets/images/book2/unit1/blackboard.jpeg")
      ],
      ["There is a speaker in the classroom.", "There is not a telephone on the desk.", "Is there a door?", "Yes, there is.", "Is there a fan?", "No, there is not."],
      [["-ake", ["bake", "cake", "lake"]], ["-ape", ["cape", "nape", "tape"]], ["-ave", ["cave", "save", "wave"]]],
      [
        ["There is a dog in the classroom.", "教室裡有一隻狗。"], ["There is a cat on the desk.", "桌上有一隻貓。"],
        ["There is a speaker in the classroom.", "教室裡有一個喇叭。"], ["There is not a telephone on the desk.", "桌上沒有電話。"],
        ["Is there a door?", "有一扇門嗎？"], ["Yes, there is.", "是的，有。"], ["Is there a fan?", "有一台電風扇嗎？"],
        ["No, there is not.", "不，沒有。"], ["Is there a dog?", "有一隻狗嗎？"], ["Yes, there is. There is a dog!", "是的，有。有一隻狗！"],
        ["There is a cat, too.", "也有一隻貓。"]
      ]
    ),
    unit(
      "unit-2", "Are there fifteen books?", "Numbers 11–20",
      [
        v("eleven", "十一", "", "11"), v("twelve", "十二", "", "12"), v("thirteen", "十三", "", "13"),
        v("fourteen", "十四", "", "14"), v("fifteen", "十五", "", "15"), v("sixteen", "十六", "", "16"),
        v("seventeen", "十七", "", "17"), v("eighteen", "十八", "", "18"), v("nineteen", "十九", "", "19"), v("twenty", "二十", "", "20")
      ],
      ["There are fifteen books in the room.", "There are not fifteen pens on the desk.", "Are there eleven windows?", "No, there are not.", "Are there fifteen books?", "Yes, there are."],
      [["-ame", ["game", "name", "same"]], ["-ane", ["cane", "lane", "mane"]], ["-ate", ["date", "gate", "late"]]],
      [
        ["There are fifteen books in the room.", "房間裡有十五本書。"], ["There are eleven books in the room.", "房間裡有十一本書。"],
        ["There are not fifteen pens on the desk.", "桌上沒有十五枝筆。"], ["Are there eleven windows?", "有十一扇窗戶嗎？"],
        ["No, there are not.", "不，沒有。"], ["Are there fifteen books?", "有十五本書嗎？"], ["Yes, there are.", "是的，有。"],
        ["There are fifteen books.", "有十五本書。"]
      ]
    ),
    unit(
      "unit-3", "How many blocks are there?", "Toys",
      [
        v("teddy bear", "泰迪熊", "assets/images/book2/unit3/teddy-bear.jpeg"), v("blocks", "積木", "assets/images/book2/unit3/blocks.jpeg", "", ["block"]),
        v("doll", "洋娃娃", "assets/images/book2/unit3/doll.jpeg"), v("ball", "球", "assets/images/book2/unit3/ball.jpeg", "", ["balls"]),
        v("video game", "電玩遊戲", "assets/images/book2/unit3/video-game.png"), v("yo-yo", "溜溜球", "assets/images/book2/unit3/yo-yo.jpeg", "", ["yo-yos"]),
        v("board game", "桌遊", "assets/images/book2/unit3/board-game.jpeg"), v("robot", "機器人", "assets/images/book2/unit3/robot.jpeg")
      ],
      ["How many blocks are there?", "There are ten blocks.", "How many balls are there?", "There is one ball.", "How many yo-yos are there?", "There are five yo-yos."],
      [["-ike", ["bike", "hike"]], ["-ime", ["dime", "time"]], ["-ine", ["line", "pine"]], ["-ite", ["bite", "kite"]]],
      [
        ["How many blocks are there?", "有多少塊積木？"], ["There are ten blocks.", "有十塊積木。"], ["How many balls are there?", "有多少顆球？"],
        ["There is one ball.", "有一顆球。"], ["How many yo-yos are there?", "有多少個溜溜球？"], ["There are five yo-yos.", "有五個溜溜球。"],
        ["Let's count.", "我們來數一數。"], ["One, two, three ... ten.", "一、二、三……十。"], ["There are ten blocks.", "有十塊積木。"]
      ]
    ),
    unit(
      "unit-4", "What are these?", "Fruit",
      [
        v("papaya(s)", "木瓜", "assets/images/book2/unit4/papaya.jpeg", "", ["papaya", "papayas"]), v("guava(s)", "芭樂", "assets/images/book2/unit4/guava.jpeg", "", ["guava", "guavas"]),
        v("pear(s)", "梨子", "assets/images/book2/unit4/pear.jpeg", "", ["pear", "pears"]), v("banana(s)", "香蕉", "assets/images/book2/unit4/banana.jpeg", "", ["banana", "bananas"]),
        v("watermelon(s)", "西瓜", "assets/images/book2/unit4/watermelon.png", "", ["watermelon", "watermelons"]), v("lemon(s)", "檸檬", "assets/images/book2/unit4/lemon.jpeg", "", ["lemon", "lemons"]),
        v("melon(s)", "甜瓜", "assets/images/book2/unit4/melon.jpeg", "", ["melon", "melons"]), v("grape(s)", "葡萄", "assets/images/book2/unit4/grape.jpeg", "", ["grape", "grapes"])
      ],
      ["These are bananas.", "Those are guavas.", "What are these?", "These are pears.", "What are those?", "They are watermelons."],
      [["-ide", ["hide", "ride"]], ["-ipe", ["pipe", "wipe"]], ["-ire", ["fire", "tire"]], ["-ive", ["dive", "hive"]]],
      [
        ["These are bananas.", "這些是香蕉。"], ["Those are guavas.", "那些是芭樂。"], ["These are his pears.", "這些是他的梨子。"],
        ["These are my lemons.", "這些是我的檸檬。"], ["Those are not his grapes.", "那些不是他的葡萄。"], ["What are these?", "這些是什麼？"],
        ["These are pears.", "這些是梨子。"], ["What are those?", "那些是什麼？"], ["They are watermelons.", "它們是西瓜。"],
        ["Can we buy some guavas?", "我們可以買一些芭樂嗎？"], ["Yes, we can.", "是的，可以。"], ["These bananas are big.", "這些香蕉很大。"]
      ]
    ),
    unit(
      "unit-5", "Are these tomatoes?", "Fruit",
      [
        v("orange(s)", "柳橙", "assets/images/book2/unit5/orange.jpeg", "", ["orange", "oranges"]), v("peach(es)", "桃子", "assets/images/book2/unit5/peach.jpeg", "", ["peach", "peaches"]),
        v("strawberry", "草莓", "assets/images/book2/unit5/strawberry.jpeg", "", ["strawberries"]), v("kiwi(s)", "奇異果", "assets/images/book2/unit5/kiwi.jpeg", "", ["kiwi", "kiwis"]),
        v("mango(es)", "芒果", "assets/images/book2/unit5/mango.jpeg", "", ["mango", "mangoes"]), v("tomato(es)", "番茄", "assets/images/book2/unit5/tomato.jpeg", "", ["tomato", "tomatoes"]),
        v("cherry / cherries", "櫻桃", "assets/images/book2/unit5/cherry.jpeg", "", ["cherry", "cherries"]), v("coconut(s)", "椰子", "assets/images/book2/unit5/coconut.jpeg", "", ["coconut", "coconuts"])
      ],
      ["Are these tomatoes?", "Yes, they are.", "What are those?", "They are kiwis.", "Are those peaches?", "No, they are not."],
      [["-obe", ["lobe", "robe"]], ["-one", ["bone", "cone"]], ["-ose", ["hose", "rose"]], ["-ote", ["note", "vote"]]],
      [
        ["Are these tomatoes?", "這些是番茄嗎？"], ["Yes, they are.", "是的，它們是。"], ["What are those?", "那些是什麼？"],
        ["They are kiwis.", "它們是奇異果。"], ["Are these kiwis?", "這些是奇異果嗎？"], ["Yes, they are.", "是的，它們是。"],
        ["Are those peaches?", "那些是桃子嗎？"], ["No, they are not.", "不，它們不是。"], ["Excuse me. What are those?", "不好意思，那些是什麼？"],
        ["They are kiwis.", "它們是奇異果。"]
      ]
    ),
    unit(
      "unit-6", "Can you write?", "Actions",
      [
        v("jump", "跳", "assets/images/book2/unit6/jump.jpg"), v("read", "閱讀", "assets/images/book2/unit6/read.jpeg"),
        v("write", "寫字", "assets/images/book2/unit6/write.jpeg"), v("type", "打字", "assets/images/book2/unit6/type.jpeg"),
        v("dance", "跳舞", "assets/images/book2/unit6/dance.jpeg"), v("sing", "唱歌", "assets/images/book2/unit6/sing.jpeg"),
        v("run", "跑步", "assets/images/book2/unit6/run.jpeg"), v("swim", "游泳", "assets/images/book2/unit6/swim.jpeg")
      ],
      ["He can jump.", "I can sing.", "Can you write?", "Yes, I can.", "Can you dance?", "No, we can't."],
      [["-oke", ["joke", "poke"]], ["-ole", ["hole", "mole"]], ["-ope", ["hope", "rope"]], ["-ore", ["bore", "sore"]]],
      [
        ["He can jump.", "他會跳。"], ["I can sing.", "我會唱歌。"], ["We can read.", "我們會閱讀。"], ["Can you write?", "你會寫字嗎？"],
        ["Yes, I can.", "是的，我會。"], ["I can swim.", "我會游泳。"], ["You can't jump.", "你不會跳。"], ["She can run.", "她會跑步。"],
        ["They can't type.", "他們不會打字。"], ["Can you dance?", "你們會跳舞嗎？"], ["No, we can't.", "不，我們不會。"],
        ["Can Goody jump?", "Goody 會跳嗎？"], ["Yes, he can.", "是的，他會。"]
      ]
    ),
    unit(
      "unit-7", "Where is my book?", "Locations",
      [
        v("on", "在……上面", "assets/images/book2/unit7/on.png"), v("in", "在……裡面", "assets/images/book2/unit7/in.jpeg"),
        v("under", "在……下面", "assets/images/book2/unit7/under.png"), v("behind", "在……後面", "assets/images/book2/unit7/behind.png"),
        v("in front of", "在……前面", "assets/images/book2/unit7/in-front-of.jpg"), v("between", "在……之間", "assets/images/book2/unit7/between.png"),
        v("next to", "在……旁邊", "assets/images/book2/unit7/next-to.jpeg"), v("near", "在……附近", "assets/images/book2/unit7/near.jpeg")
      ],
      ["Where is my book?", "It is under the desk.", "Where is Goody?", "He is behind the desk.", "Is it next to the window?", "Yes, it is."],
      [["-ube", ["cube", "tube"]], ["-ule", ["mule", "rule"]], ["-use", ["fuse", "muse"]], ["-ute", ["cute", "mute"]]],
      [
        ["Where is my book?", "我的書在哪裡？"], ["It is under the desk.", "它在桌子下面。"], ["Where is Goody?", "Goody 在哪裡？"],
        ["He is behind the desk.", "他在桌子後面。"], ["My book is on the desk.", "我的書在桌上。"], ["The ruler is under my chair.", "尺在我的椅子下面。"],
        ["Where is my pen?", "我的筆在哪裡？"], ["It is in your pencil case.", "它在你的鉛筆盒裡。"], ["Is it next to the window?", "它在窗戶旁邊嗎？"],
        ["Yes, it is.", "是的。"], ["I can't find my doll.", "我找不到我的洋娃娃。"], ["Is it behind the desk?", "它在桌子後面嗎？"],
        ["No, it is not.", "不，不在。"], ["It is under the desk.", "它在桌子下面。"]
      ]
    ),
    unit(
      "unit-8", "Where are you?", "Rooms and Places",
      [
        v("bathroom", "浴室", "assets/images/book2/unit8/bathroom.jpg"), v("bedroom", "臥室", "assets/images/book2/unit8/bedroom.jpeg"),
        v("kitchen", "廚房", "assets/images/book2/unit8/kitchen.jpeg"), v("dining room", "飯廳", "assets/images/book2/unit8/dining-room.jpeg"),
        v("yard", "院子", "assets/images/book2/unit8/yard.jpeg"), v("living room", "客廳", "assets/images/book2/unit8/living-room.jpg"),
        v("basement", "地下室", "assets/images/book2/unit8/basement.jpeg"), v("garden", "花園", "assets/images/book2/unit8/garden.jpeg")
      ],
      ["Where are you?", "I am in the living room.", "Where is his father?", "He is in the garden.", "Is he in the yard?", "Yes, he is."],
      [["-uke", ["cuke", "duke", "puke"]], ["-une", ["dune", "June", "tune"]], ["-ure", ["cure", "lure", "pure"]]],
      [
        ["Where are you?", "你在哪裡？"], ["I am in the living room.", "我在客廳裡。"], ["Where is his father?", "他的爸爸在哪裡？"],
        ["He is in the garden.", "他在花園裡。"], ["Where are they?", "他們在哪裡？"], ["They are in the garden.", "他們在花園裡。"],
        ["Is he in the yard?", "他在院子裡嗎？"], ["Yes, he is.", "是的，他在。"], ["Where are you, Daddy?", "爸爸，你在哪裡？"],
        ["I am home.", "我在家。"], ["Are you in the living room?", "你在客廳裡嗎？"], ["Yes, I am.", "是的，我在。"]
      ]
    ),
    unit(
      "unit-9", "What do you like?", "Animals",
      [
        v("parrot", "鸚鵡", "assets/images/book2/unit9/parrot.jpeg"), v("snake", "蛇", "assets/images/book2/unit9/snake.jpeg"),
        v("monkey", "猴子", "assets/images/book2/unit9/monkey.jpeg"), v("goat", "山羊", "assets/images/book2/unit9/goat.jpeg"),
        v("elephant", "大象", "assets/images/book2/unit9/elephant.jpeg"), v("bear", "熊", "assets/images/book2/unit9/bear.jpeg"),
        v("lion", "獅子", "assets/images/book2/unit9/lion.jpeg"), v("hippo", "河馬", "assets/images/book2/unit9/hippo.jpeg"),
        v("zebra", "斑馬", "assets/images/book2/unit9/zebra.jpg"), v("tiger", "老虎", "assets/images/book2/unit9/tiger.jpeg")
      ],
      ["I like tigers.", "I don't like tigers.", "What do you like?", "We like lions.", "Do you like bears?", "Yes, I do."],
      [["Long a", ["bake", "game"]], ["Long i", ["bike", "hide"]], ["Long o", ["robe", "joke"]], ["Long u", ["cube", "duke"]]],
      [
        ["I like tigers.", "我喜歡老虎。"], ["I don't like tigers.", "我不喜歡老虎。"], ["They don't like snakes.", "他們不喜歡蛇。"],
        ["What do you like?", "你們喜歡什麼？"], ["We like lions.", "我們喜歡獅子。"], ["Do you like bears?", "你喜歡熊嗎？"],
        ["Yes, I do.", "是的，我喜歡。"], ["Do you like tigers?", "你喜歡老虎嗎？"], ["No, I don't.", "不，我不喜歡。"],
        ["What do you like?", "你喜歡什麼？"], ["I like lions.", "我喜歡獅子。"]
      ]
    )
  ];

  const atlasLayouts = {
    "unit-1": {
      src: "assets/images/book2/atlases/classroom.png",
      cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2]]
    },
    "unit-3": {
      src: "assets/images/book2/atlases/toys-fruit.png",
      cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]]
    },
    "unit-4": {
      src: "assets/images/book2/atlases/toys-fruit.png",
      cells: [[0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]]
    },
    "unit-5": {
      src: "assets/images/book2/atlases/fruit-actions.png",
      cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]]
    },
    "unit-6": {
      src: "assets/images/book2/atlases/fruit-actions.png",
      cells: [[0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]]
    },
    "unit-7": {
      src: "assets/images/book2/atlases/locations-rooms.png",
      cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]]
    },
    "unit-8": {
      src: "assets/images/book2/atlases/locations-rooms.png",
      cells: [[0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]]
    },
    "unit-9": {
      src: "assets/images/book2/atlases/animals.png",
      cells: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2]]
    }
  };

  units.forEach((courseUnit) => {
    const layout = atlasLayouts[courseUnit.id];
    if (!layout) return;
    courseUnit.vocabulary.forEach((item, index) => {
      const [col, row] = layout.cells[index];
      item.image = "";
      item.sprite = { src: layout.src, cols: 4, rows: 4, col, row };
    });
  });

  window.CURRICULUM_BOOKS.push({ id: "book-2", title: "Book 2", subtitle: "Everyday English", units });
  window.CURRICULUM_BOOKS.push({ id: "book-3", title: "Book 3", subtitle: "Growing Skills", units: [] });
})();
