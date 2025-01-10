class ExperienceSession {
  sessionId = null;
  primaryPeer = null;

  constructor(sessionId = null) {
    sessionId = sessionId ?? Date.now(); //Todo: Change to a random hash code (preferably can generate a session uid in the db and use that as the hash)
  }

  SetPrimaryPeer = peer => {
    this.primaryPeer = peer;
  };
}
