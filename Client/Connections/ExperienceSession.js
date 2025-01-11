class ExperienceSession {
  sessionId = null;
  url = null;
  primaryPeerConnection = null;

  constructor(sessionId = null, url = '', primaryPeerConnection = null) {
    this.sessionId = sessionId;
    this.url = url;
    this.primaryPeerConnection = primaryPeerConnection;
  }

  setPrimaryPeerConnection = (peerConnection) => {
    this.primaryPeerConnection = peerConnection;
  };
}
