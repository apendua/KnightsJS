# KnightsJS

It's a simple [React](https://facebook.github.io/react/) project
inspired by good old [Homm3](https://en.wikipedia.org/wiki/Heroes_of_Might_and_Magic_III).
I've built it for a Meteor talk at a JavasScript Meetup in Kraków.
A live demo is available [here](http://apendua.github.io/KnightsJS/).

## Installing and running

To run the demo you will need to install [meteor](https://www.meteor.com/install) first, so
```
curl https://install.meteor.com/ | sh
```
Then clone this repo, go to the project root and run
```
meteor npm install
```
to install all dependencies. Finally run
```
meteor
```
and navigate your browser to [http://localhost:3000](http://localhost:3000).

![screen](https://raw.githubusercontent.com/apendua/KnightsJS/master/public/screen_01.png)

## WebPack

You will need to install `webpack` globally first
```
npm install -g webpack webpack-dev-server
```
Then go to the project root and run
```
webpack-dev-sever
```
