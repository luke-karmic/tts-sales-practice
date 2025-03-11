const fs = require("fs");
const path = require("path"); // Add this line to require the path module

// Function to initialize the run folder for the session
module.exports.initializeRunFolder = (dir) => {
  const full = process.env.OUT_DIR_PATH + dir

  function getNextRunNumber() {
    let runNumber = 1;

    // Get all the existing directories inside the 'dir' folder
    const existingDirs = fs.readdirSync(full).filter((file) =>
      fs.statSync(path.join(full, file)).isDirectory()
    );

    // Find the next available run number
    if (existingDirs.length > 0) {
      const lastRunNumber = existingDirs
        .map((dir) => parseInt(dir.split('-')[0].replace('run', '')))
        .sort((a, b) => b - a)[0]; // Get the highest run number
      runNumber = lastRunNumber + 1;
    }

    return runNumber;
  }

  // Get the next available run folder
  const runNumber = getNextRunNumber();
  runFolder = path.join(full, `${runNumber}`);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(runFolder)) {
    fs.mkdirSync(runFolder, { recursive: true });
  }

  console.log(`Session folder initialized: ${runFolder}`);

  return runFolder;
}