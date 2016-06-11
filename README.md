# KnightsJS

It's a simple demo project which I've built for a Meteor talk
at a JavasScript Meetup in Kraków.

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
