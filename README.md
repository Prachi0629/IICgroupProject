# ICAIISD Project
This is a React Native/Expo app developed for the International Conference ICAIISD 2025. This app provides authentication of attendees and meals throught QRcode scanning and database.

## # Installation
Follow the steps to set up expo and other things on your system considering you use windows.

### # Requirements
* [NodeJS](http://nodejs.org/en/download) - Install NodeJS.
* [Git](https://git-scm.com/) - Git and Github Account.
* [VScode](https://code.visualstudio.com/download) - IDE like vscode to edit code.
* [JavaJDK](https://www.oracle.com/in/java/technologies/downloads/) - JavaJDK for keytools.
## # Installation for Expo-cli and React Native
Open **Gitbash** or **Powershell** as administrator and type 

```bash
node --version
```

If it shows the version then node is successfully installed.
```bash
v22.18.0
```

Now install **Expo-Cli** using following command 
```bash
npm install -g expo-cli
```

Once Expo is installed Git clone this repo it to your system, type
```bash
git clone git@github.com:Prachi0629/IICgroupProject.git
```

Change directory to **ICAIISDApp**
```bash
cd icaiisdApp
```
**Here we have get inside our app directory**

Now run below command to install nescessary dependencies.
```bash
npm install
```
**OR**

Run below command to install everything manually
```bash
npm install @react-navigation/native@^7.1.17 @react-navigation/native-stack@^7.3.25 expo@~53.0.20 expo-camera@~16.1.11 expo-status-bar@~2.2.3 react@^19.0.0 react-native@^0.79.5 react-native-safe-area-context@^5.4.0 react-native-screens@~4.11.1
```
Run **expo-doctor** to check if any errors or plugins missing
```bash
npx expo-doctor
```

## # Run Expo App

Make sure you are in main app directory, then run this command 
```bash
npx expo start
```

This will start **Expo app** and then you can run it on your android by typing **'a'**, type **'w'** to start on web.

```bash
Use Cltr + C to stop running the app.
```
Here we have done coding now its time to build apk.
## # Setting up Expo Application Services
Make sure you have installed **JavaJDK** as mentioned earlier so that **keytools** are installed.
Here we will use **EAS services** which build expo cli directly 

* Create an account on **EAS**: [Expo DEV](https://expo.dev/) 

### # Configure EAS:
Run below command to install **eas-cli**
```bash
npm install -g eas-cli
```

Once installed succesfully run below command to check if there are no errors

```bash
eas --version
```

* Login with EAS through online account
```bash
eas login
```

Enter your username and password and once done you are not connected now we must head towards building the apk.

## # Building APK
Here we go, final step to build the apk, first of all we must configure packages for our build to do that run
```bash
eas build:configure
```

After this is done now its time to start build 
```bash 
eas build -p android --profile preview
```

Note that this command is for **.apk** build not the common **.aab** which is used for **playstore**.

Once the build is finished download it and install in android device and enjoy.

> Happy Hacking!

