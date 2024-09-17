# Backend for Shopping Cart - NodeJS

Runs a node.js server as the backend, interfacing with mongoDB. 

## Technical details

- Verifies JWT tokens passed in with the requests and also authorizes certain actions which require higher privileges.

## .env variables

All fields mentioned in nodemon.json.example must be filled with correct values and renamed as nodemon.json. 

    - MONGOENDPOINT - Mongo DB Atlas connection string
    - STARTPORT - Port that this server will run on. Will be overriden by PORT
    - HASHSECRET - secret for hashing
    - REFRESHSECRET - secret for hashing
    - TOKENEXPIRATION - Time after which token expires.
    - REFRESHTOKENEXPIRATION - Time after which refresh token expires.
    

## Available Scripts

In the project directory, you can run:

### `npm run start:server`

Runs the app in the development mode. Uses variables from nodemon.json.<br />

### `npm start`

Starts the app. Need to manually set environment variables.

## Deployment

Whenever a git commit is done, project will auto deploy.




