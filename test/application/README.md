# MusicBox

3ap assignment app readme

## Getting Started

Use this instructions fog getting the project up and running on your local machine for testing purposes.

### Prerequisites

Application was build with angular version 5.0.0, with rxjs. For server side node/express is used.

Regarding UI, angular material was used(forms, input, button, tab, dialog, slider, snackBar...). Also app is using angular flex components.

For testing this app you need node and npm.


### Installing

Before you can test the app you have to pull server dependencies from npm.

You can do that by running npm install in application root


```
npm install
```

Since build was already added you can just run node app.js to test the app with current build.

```
node app.js
```

The app has predefined values for client_id and client_secret for authorization to Spotify API. If you want to add your credentials you can pass it as argument when running node server.

```
node app.js client_id={yourId} client_secret={yourSecret}
```

For checking source code and making your own build, switch to source folder.
First run npm install for pulling app's dependencies

```
npm install
```

Now you can serve or build app with angular commands

```
ng serve
```

```
ng build
```

After running ng build you can find dist folder, which is default for placing deployment script

## Built With

* [Angular 5.0.0](https://angular.io/) - The web framework used
* [Material](https://material.angular.io/) - UI library
* [Node](https://nodejs.org/en/) - Used for server side


## Author

**Dalibor Rajic**

