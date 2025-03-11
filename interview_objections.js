require('dotenv').config()

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require('os');
const { initializeRunFolder } = require('./runs')
const { getVoiceSettings } = require('./voice')
const objections = require('./data/random_objections');

// Global variable to store the run folder for the session and a set to track asked objections
let runFolder = null;
let askedObjections = new Set(); // To track objections that have already been asked

// Function to pick a random objection
function getRandomObjection() {
  const keys = Object.keys(objections); // Get all the keys of the objections object
  const remainingKeys = keys.filter(key => !askedObjections.has(key)); // Filter out already asked objections

  if (remainingKeys.length === 0) {
    console.log("All objections have been asked. Exiting.");
    return null; // No more objections to ask
  }

  const randomKey = remainingKeys[Math.floor(Math.random() * remainingKeys.length)]; // Pick a random key from remaining objections
  return { key: randomKey, text: objections[randomKey] }; // Return the key and its corresponding text
}


// Function to ask an objection and record the answer
async function askObjection() {
  if (!runFolder) {
    // Initialize the session folder if it hasn't been created yet
    const initFolder = initializeRunFolder('objections');

    const objection = getRandomObjection();
    if (!objection) {
      // No more objections to ask, exit the process
      return;
    }

    console.log(`AI asks: ${objection.text}`);
    console.log('TEST', initFolder)
    const filename = path.join(initFolder, `${objection.key}.wav`);

    // Check if the file already exists, if so skip this objection
    if (fs.existsSync(filename)) {
      console.log(`File ${filename} already exists. Skipping this objection...\n`);
      return; // Skip this question and exit
    }

    // Mark this objection as asked
    askedObjections.add(objection.key);

    // Use Google TTS to ask the objection
    const url = getVoiceSettings(objection.text, 'en-GB')

    // Print the URL for manual checking
    console.log(`Generated audio URL: ${url}`);

    // Fetch the audio and save it to a file
    try {
      const audioStream = await fetch(url);
      const audioBuffer = await audioStream.arrayBuffer(); // Use arrayBuffer() for binary data
      const buffer = Buffer.from(audioBuffer);

      // Save the audio to a temporary file
      fs.writeFileSync(filename, buffer);

      console.log(`Audio saved to: ${filename}`);

      // Detect the platform and select the appropriate player
      let playerCommand, playerArgs;
      if (os.platform() === 'win32') {
        playerCommand = 'powershell';
        playerArgs = ['-Command', 'Start-Process', 'wmplayer', '-ArgumentList', filename];
      } else if (os.platform() === 'darwin') {
        playerCommand = 'afplay'; // For macOS
        playerArgs = [filename];
      } else {
        playerCommand = 'aplay'; // Default to aplay for Linux
        playerArgs = [filename];
      }

      const player = spawn(playerCommand, playerArgs);

      player.on('error', (err) => {
        console.error('Error playing audio:', err);
      });

      player.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Audio player exited with code ${code}`);
        } else {
          console.log("Audio played successfully");
          console.log("Listening for your response...");

          // Start recording the user's answer with dynamic filename
          const record = spawn("rec", [
            filename,
            "silence", "1", "0.1", "1%",  // Start recording on sound detection
            "1", process.env.SILENCE_DELAY_END_REC, "1%"        // Stop if silent for 2 seconds
          ]);

          record.on("exit", () => {
            console.log(`Recording saved as: ${filename}\n`);
            setTimeout(askObjection, process.env.NEXT_QUESTION_DELAY);
          });

          record.on("error", (err) => {
            console.log(err);
          });
        }
      });

    } catch (err) {
      console.log('Error fetching the audio:', err);
    }
  }
}

// Start the process once
askObjection();
