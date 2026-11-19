param([string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot))

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = -1

$contextTracks = @{
  "b1-u5-pen" = @("What is it?", "It is a pen.", "Is it an eraser?", "No, it is not.")
  "b2-u5-fruit" = @("What are these?", "They are strawberries.", "Are those strawberries?", "No, they aren't. They are kiwis.")
  "b2-u7-book" = @("Where is my book?", "It is under the desk.", "Is Goody under the desk, too?", "No. He is behind the desk.")
  "b3-u2-food" = @("Does Lumi like pizza?", "No, she doesn't.", "What does she like?", "She likes hamburgers.")
}

$phonicsTracks = @{
  "sio2-unit1-cape" = "cape"; "sio2-unit1-rain" = "rain"; "sio2-unit1-hay" = "hay"
  "sio2-unit2-eve" = "eve"; "sio2-unit2-meat" = "meat"; "sio2-unit2-bee" = "bee"
  "sio2-unit3-bike" = "bike"; "sio2-unit3-night" = "night"; "sio2-unit3-wild" = "wild"
  "sio2-unit4-bone" = "bone"; "sio2-unit4-road" = "road"; "sio2-unit4-toe" = "toe"
  "sio2-unit5-cute" = "cute"; "sio2-unit5-blue" = "blue"; "sio2-unit5-juice" = "juice"
  "sio2-unit6-cake" = "cake"; "sio2-unit6-cone" = "cone"; "sio2-unit6-face" = "face"
  "sio2-unit7-game" = "game"; "sio2-unit7-goat" = "goat"; "sio2-unit7-giant" = "giant"
  "sio2-unit8-barn" = "barn"; "sio2-unit8-car" = "car"; "sio2-unit8-jar" = "jar"
  "sio2-unit9-fern" = "fern"; "sio2-unit9-mermaid" = "mermaid"; "sio2-unit9-first" = "first"
  "sio2-unit10-cheese" = "cheese"; "sio2-unit10-peach" = "peach"; "sio2-unit10-sheep" = "sheep"
  "sio2-unit11-thin" = "thin"; "sio2-unit11-math" = "math"; "sio2-unit11-match" = "match"
  "sio2-unit12-phone" = "phone"; "sio2-unit12-photo" = "photo"; "sio2-unit12-dolphin" = "dolphin"
  "sio3-unit1-august" = "August"; "sio3-unit1-faucet" = "faucet"; "sio3-unit1-yawn" = "yawn"
  "sio3-unit2-couch" = "couch"; "sio3-unit2-loud" = "loud"; "sio3-unit2-shout" = "shout"
  "sio3-unit3-oil" = "oil"; "sio3-unit3-coin" = "coin"; "sio3-unit3-oyster" = "oyster"
  "sio3-unit4-head" = "head"; "sio3-unit4-weather" = "weather"; "sio3-unit4-cook" = "cook"
  "sio3-unit5-baby" = "baby"; "sio3-unit5-candy" = "candy"; "sio3-unit5-why" = "why"
  "sio3-unit6-blade" = "blade"; "sio3-unit6-clip" = "clip"; "sio3-unit6-plate" = "plate"
  "sio3-unit7-brown" = "brown"; "sio3-unit7-brush" = "brush"; "sio3-unit7-grape" = "grape"
  "sio3-unit8-scarf" = "scarf"; "sio3-unit8-skate" = "skate"; "sio3-unit8-stand" = "stand"
  "sio3-unit9-school" = "school"; "sio3-unit9-throw" = "throw"; "sio3-unit9-street" = "street"
  "sio3-unit10-train" = "train"; "sio3-unit10-trap" = "trap"; "sio3-unit10-tray" = "tray"
  "sio3-unit11-knee" = "knee"; "sio3-unit11-knit" = "knit"; "sio3-unit11-know" = "know"
  "sio3-unit12-back" = "back"; "sio3-unit12-lick" = "lick"; "sio3-unit12-sick" = "sick"
}

$listeningDir = Join-Path $ProjectRoot "assets/audio/listening"
$phonicsDir = Join-Path $ProjectRoot "assets/audio/phonics"
New-Item -ItemType Directory -Force -Path $listeningDir, $phonicsDir | Out-Null

foreach ($entry in $contextTracks.GetEnumerator()) {
  $prompt = New-Object System.Speech.Synthesis.PromptBuilder
  foreach ($line in $entry.Value) { $prompt.AppendText($line); $prompt.AppendBreak([TimeSpan]::FromMilliseconds(450)) }
  $path = Join-Path $listeningDir ($entry.Key + ".wav")
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($prompt)
  $synth.SetOutputToNull()
}

foreach ($entry in $phonicsTracks.GetEnumerator()) {
  $prompt = New-Object System.Speech.Synthesis.PromptBuilder
  $prompt.AppendText($entry.Value)
  $prompt.AppendBreak([TimeSpan]::FromMilliseconds(700))
  $prompt.AppendText($entry.Value)
  $path = Join-Path $phonicsDir ($entry.Key + ".wav")
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($prompt)
  $synth.SetOutputToNull()
}

$synth.Dispose()
Write-Output "Generated $($contextTracks.Count + $phonicsTracks.Count) listening files."
