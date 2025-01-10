class ExperienceSession {
  sessionId = null;
  primaryPeer = null;

  constructor(sessionId = null) {
    this.sessionId = sessionId;
  }

  SetPrimaryPeer = peer => {
    this.primaryPeer = peer;
  };
}
