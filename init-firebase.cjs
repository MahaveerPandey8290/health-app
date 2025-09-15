
// This script is not intended to be part of the app's source code.
// It's a helper for you to get your Firebase project set up.

const fs = require('fs');
const { exec } = require('child_process');

// 1. Install Firebase CLI
exec('npm install -g firebase-tools', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error installing Firebase CLI: ${err}`);
    return;
  }
  console.log(stdout);

  // 2. Login to Firebase
  exec('firebase login', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error logging into Firebase: ${err}`);
      return;
    }
    console.log(stdout);

    // 3. Initialize Firebase
    exec('firebase init', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error initializing Firebase: ${err}`);
        return;
      }
      console.log(stdout);

      // 4. Create .firebaserc
      const firebasercContent = `{
        "projects": {
          "default": "your-project-id"
        }
      }`;
      fs.writeFileSync('.firebaserc', firebasercContent);
      console.log('.firebaserc created. Please replace "your-project-id" with your actual Firebase project ID.');
    });
  });
});
