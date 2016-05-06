Real-time web-based collaborative coding<br/>

## Features
- Syntax highlighting code editor (using Ace)
- Live edit merging via operational transforms
- Load files from GitHub repositories and save changes as a patch
- Audio and video through WebRTC

## Design overview
Pairjam is separated into **client** and **server** components.

The client consists solely of static files, which means it can be served quickly and cheaply on a CDN (pairjam.com assets are hosted on GitHub pages). The client uses WebSockets for communication, WebRTC for peer-to-peer audio / video, and React.js.

The server is a Node.js WebSocket server that can run on one or more separate machines.

## Running your own
### Setup
To get Pairjam running on your local machine, first clone the repository
```bash
git clone https://github.com/neerajwahi/pairjam.git
```

Next, install npm dependencies
```bash
cd server && npm install
cd ../client && npm install
```

To integrate the server with GitHub, a GitHub API public key and secret are needed. These should be placed in the GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables before running the node server.

If the server does not find these env variables upon loading, rate requests will be limited to GitHub's unauthenticated limit.

### Running locally
Once setup has been completed, run the WebSocket server:
```bash
cd ../server && node app.js
```

Then in a new tab, serve the static files from the `client/public` directory:
```bash
cd ../client/public && python -m SimpleHTTPServer 8000
```

### Hosted
*Instructions coming soon!*

## Building Pairjam
Pairjam uses [gulp.js](http://gulpjs.com/) for its build system.

### Client
If you're working on the client, run
```bash
cd /path/to/client
gulp && gulp watch
```
This will build the app and watch any .jsx or .scss files for changes.

### Server
The server won't reflect your changes until you re-run it. To watch the server and re-run it automatically try [nodemon](http://nodemon.io/).

## License
MIT
