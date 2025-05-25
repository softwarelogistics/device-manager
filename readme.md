# NuvIoT - React Native Platform

This platform contains a number of pages that can be assembled to create mobile apps that interact with NuvIoT devices via BlueTooth.

To setup an app, Copy the App.XXXX.json into the app.json file (make sure if you change anything in app.json, you copy those changes back into the App.XXXX.json file)

Also change the export method in App.tsx to export the correct app file.

eas build --profile (production, development, preview)
eas submit --platform XXXX (ios/android)

