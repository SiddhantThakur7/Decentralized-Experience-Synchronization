class ExperienceSession {
  sessionId = null;
  url = null;
  primaryOfferIndex = null;
  primaryPeerConnection = null;

  constructor(sessionId = null, url = '', primaryPeerConnection = null, primaryOfferIndex = null) {
    this.sessionId = sessionId;
    this.url = url;
    this.primaryPeerConnection = primaryPeerConnection;
    this.primaryOfferIndex = primaryOfferIndex;
  }

  SetPrimaryPeerConnection = (peerConnection) => {
    this.primaryPeerConnection = peerConnection;
  };
}

export default ExperienceSession;