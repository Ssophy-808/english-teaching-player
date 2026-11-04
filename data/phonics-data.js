(function () {
  "use strict";

  const words = [
    { word: "cape", vowelType: "long-a", pattern: "a_e", audio: "", clue: "starts with C", core: true },
    { word: "late", vowelType: "long-a", pattern: "a_e", audio: "", clue: "starts with L", core: true },
    { word: "nail", vowelType: "long-a", pattern: "ai", audio: "", clue: "starts with N", core: true },
    { word: "rain", vowelType: "long-a", pattern: "ai", audio: "", clue: "starts with R", core: true },
    { word: "hay", vowelType: "long-a", pattern: "ay", audio: "", clue: "starts with H", core: true },
    { word: "ray", vowelType: "long-a", pattern: "ay", audio: "", clue: "starts with R", core: true },
    { word: "eight", vowelType: "long-a", pattern: "eigh", audio: "", clue: "a number", core: true },
    { word: "weigh", vowelType: "long-a", pattern: "eigh", audio: "", clue: "starts with W", core: true },
    { word: "cap", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with C", core: false },
    { word: "map", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with M", core: false },
    { word: "mad", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with M", core: false },
    { word: "pan", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with P", core: false },
    { word: "tap", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with T", core: false },
    { word: "hat", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with H", core: false },
    { word: "ran", vowelType: "short-a", pattern: "short-a", audio: "", clue: "starts with R", core: false },
    { word: "made", vowelType: "long-a", pattern: "a_e", audio: "", clue: "starts with M", core: false },
    { word: "tape", vowelType: "long-a", pattern: "a_e", audio: "", clue: "starts with T", core: false },
    { word: "hate", vowelType: "long-a", pattern: "a_e", audio: "", clue: "starts with H", core: false }
  ];

  window.PHONICS_COURSES = [{
    id: "sio2",
    title: "Sound It Out 2",
    subtitle: "Phonics Practice",
    units: [{
      id: "unit1",
      number: 1,
      title: "Long a",
      shortSound: "short-a",
      longSound: "long-a",
      soundLabels: { "short-a": "Short a", "long-a": "Long a" },
      patterns: [
        { id: "a_e", display: "A space E", words: ["cape", "late"] },
        { id: "ai", display: "A-I", words: ["nail", "rain"] },
        { id: "ay", display: "A-Y", words: ["hay", "ray"] },
        { id: "eigh", display: "E-I-G-H", words: ["eight", "weigh"] }
      ],
      words,
      contrastPairs: [
        ["cap", "cape"],
        ["mad", "made"],
        ["tap", "tape"],
        ["ran", "rain"],
        ["hat", "hate"]
      ],
      wordwall: { url: "", label: "Open Wordwall" },
      audioPolicy: { useBrowserTtsFallback: true, locale: "en-US" }
    }]
  }];
})();
