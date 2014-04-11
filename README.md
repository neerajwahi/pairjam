Real-time web-based collaborative coding

## Features
- Syntax highlighting code editor (using Ace)
- Live edit merging via operational transforms
- Load files from GitHub repositories
- Audio and video through WebRTC

## Design overview

Pairjam consists of two isolated components: the client and server.

### Client

### Server

#### GitHub integration

In order to integrate the server with GitHub, a GitHub API public key
and secret are needed. These should be placed in a file called github_api_secret in
the /server directory, with the following form:

```javascript
module.exports = {
	'client_id' : 'YOUR CLIENT ID',
	'client_secret' : 'YOUR CLIENT SECRET'
};
```

If the server does not find this file upon loading, rate requests will be limited to
GitHub's unauthenticated limit.
