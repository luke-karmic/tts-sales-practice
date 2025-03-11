require('dotenv').config()

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require('os');
const { getVoiceSettings } = require('./voice.js')
const { initializeRunFolder } = require('./runs')
const { skepticalAnswers, busyAnswers, analyticalAnswers, getRandomGreeting } = require('./ordered_questions');

function getRandomProspect() {
  const prospects = ["skeptical", "busy", "analytical"];
  const randomIndex = Math.floor(Math.random() * prospects.length);
  return prospects[randomIndex];
}

// Select a random prospect personality
const selectedProspect = getRandomProspect();

// Function to retrieve answers based on selected prospect personality
function getProspectAnswers(prospectType) {
  const greeting = getRandomGreeting(); // Select a random greeting

  if (prospectType === "skeptical") {
    return {
      greeting: greeting,
      ...skepticalAnswers
    };
  } else if (prospectType === "busy") {
    return {
      greeting: greeting,
      ...busyAnswers
    };
  } else if (prospectType === "analytical") {
    return {
      greeting: greeting,
      ...analyticalAnswers
    };
  }
}

const answers = getProspectAnswers(selectedProspect);

// Global variable to store the run folder for the session and a set to track asked questions
let runFolder = null;
let askedQuestions = new Set(); // To track questions that have already been asked

const answerKeys = Object.keys(answers); // Get all keys (questions) from the busyAnswers object
let currentIndex = 0; // Start at the first index
// Function to get the next question and increment the index
function getNextQuestion() {
  if (currentIndex < answerKeys.length) {
    const currentQuestionKey = answerKeys[currentIndex];
    const questionText = answers[currentQuestionKey];
    currentIndex++; // Increment the index to move to the next question
    return { key: currentQuestionKey, text: questionText };
  }
  return null; // Return null when all questions have been asked
}

const initFolder = initializeRunFolder('questions');

// Function to ask a question and record the answer
async function askQuestion() {
  if (!runFolder) {
    const question = getNextQuestion();
    if (!question) {
      console.log("All questions have been asked. Ending process.");
      return; // All questions asked, exit the process
    }

    console.log(`AI asks: ${question.text}`);

    const filename = path.join(initFolder, `${question.key}.wav`);

    // Check if the file already exists, if so skip this question
    if (fs.existsSync(filename)) {
      console.log(`File ${filename} already exists. Skipping this question...\n`);
      return;
    }

    // Mark this question as asked
    askedQuestions.add(question.key);

    // Use Google TTS to ask the question
    const url = getVoiceSettings(question.text, 'en-GB')

    // Fetch the audio and save it to a file
    try {
      const audioStream = await fetch(url);
      const audioBuffer = await audioStream.arrayBuffer();
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
        playerCommand = 'afplay';
        playerArgs = [filename];
      } else {
        playerCommand = 'aplay';
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
            "silence", "1", "0.1", "1%",
            "1", process.env.SILENCE_DELAY_END_REC, "1%"
          ]);

          record.on("exit", () => {
            console.log(`Recording saved as: ${filename}\n`);
            // After recording, proceed to ask the next question
            const delay = parseInt(process.env.NEXT_QUESTION_DELAY, 10) * 1000;
            if (!isNaN(delay)) {
              console.log(`Waiting ${process.env.NEXT_QUESTION_DELAY}'s until next question`);
              setTimeout(askQuestion, delay); // Ask another question after the specified delay
            } else {
              console.log('Invalid delay value in environment variable');
            }
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
askQuestion();
