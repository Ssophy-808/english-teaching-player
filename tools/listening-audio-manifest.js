global.window = global;
require("../data/phonics-data.js");
require("../data/listening-data.js");

const manifest = Object.entries(global.LISTENING_ITEMS || {})
  .filter(([, item]) => item.kind === "phonics-word")
  .map(([id, item]) => ({ id, audio: item.audio, transcript: item.transcript }));

process.stdout.write(JSON.stringify(manifest));
