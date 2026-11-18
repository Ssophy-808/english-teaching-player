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
  "sio2-unit1-cape" = "cape"; "sio2-unit2-eve" = "eve"; "sio2-unit3-bike" = "bike"
  "sio2-unit4-bone" = "bone"; "sio2-unit5-cute" = "cute"; "sio2-unit6-cake" = "cake"
  "sio2-unit7-game" = "game"; "sio2-unit8-barn" = "barn"; "sio2-unit9-fern" = "fern"
  "sio2-unit10-cheese" = "cheese"; "sio2-unit11-thin" = "thin"; "sio2-unit12-phone" = "phone"
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
