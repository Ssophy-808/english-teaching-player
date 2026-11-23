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

$listeningDir = Join-Path $ProjectRoot "assets/audio/listening"
New-Item -ItemType Directory -Force -Path $listeningDir | Out-Null

foreach ($entry in $contextTracks.GetEnumerator()) {
  $prompt = New-Object System.Speech.Synthesis.PromptBuilder
  foreach ($line in $entry.Value) {
    $prompt.AppendText($line)
    $prompt.AppendBreak([TimeSpan]::FromMilliseconds(450))
  }
  $path = Join-Path $listeningDir ($entry.Key + ".wav")
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($prompt)
  $synth.SetOutputToNull()
}

$manifestScript = Join-Path $PSScriptRoot "listening-audio-manifest.js"
$phonicsTracks = (& node $manifestScript | ConvertFrom-Json)
foreach ($track in $phonicsTracks) {
  $prompt = New-Object System.Speech.Synthesis.PromptBuilder
  foreach ($word in $track.transcript) {
    $prompt.AppendText([string]$word)
    $prompt.AppendBreak([TimeSpan]::FromMilliseconds(700))
  }
  $path = Join-Path $ProjectRoot ([string]$track.audio)
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $path) | Out-Null
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($prompt)
  $synth.SetOutputToNull()
}

$synth.Dispose()
Write-Output "Generated $($contextTracks.Count + $phonicsTracks.Count) listening files."
