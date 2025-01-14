class PeerConnectionEntity {
    offer = null;
    answer = null;
    peerConnection = null;
    channel = null;
    isPrimary = false;
    connected = false;

    SERVERS = {
        iceServers: [
            {
                urls: Constants.STUN_SERVERS,
            },
        ],
        iceCandidatePoolSize: 10,
    };

    constructor(isPrimary = false) {
        this.peerConnection = new RTCPeerConnection(this.SERVERS);
        this.channel = new PeerConnectionChannel(this.peerConnection);
        this.isPrimary = isPrimary;
        this.peerConnection.addEventListener('connectionstatechange', () => {
            this.connected = this.peerConnection.connectionState == 'connected';
            if (this.connected) {
                console.log("Peer connection established!");
            }
        });
    }

    SetLocalDescription = async (sdp) => {
        await this.peerConnection.setLocalDescription(sdp);
    }

    SetRemoteDescription = async (sdp) => {
        await this.peerConnection.setRemoteDescription(sdp);
    }

    Offer = async (id, suffix) => {
        this.channel.Create(id, suffix);
        const offerDescription = await this.peerConnection.createOffer();
        await this.SetLocalDescription(offerDescription);

        return new Promise((resolve) => {
            this.peerConnection.onicecandidate = (candidate) => {
                if (candidate.candidate == null) {
                    this.offer = this.peerConnection.localDescription;
                    console.log("Your offer is:", this.offer, `id=${id}, suffix=${suffix}`);
                    resolve(this.offer); // Resolve when ICE gathering is complete
                }
            };
        });
    }

    Answer = async (remoteSdp) => {
        if (this.peerConnection.remoteDescription) {
            return
        }
        const remoteDescription = new RTCSessionDescription(remoteSdp);
        this.channel.Discover();
        await this.SetRemoteDescription(remoteDescription);
        if (this.offer) {
            this.answer = this.peerConnection.remoteDescription;
            return this.peerConnection.remoteDescription;
        } else {
            this.offer = this.peerConnection.remoteDescription;
        }

        const answerDescription = await this.peerConnection.createAnswer();
        await this.SetLocalDescription(answerDescription);
        return new Promise((resolve) => {
            this.peerConnection.onicecandidate = (candidate) => {
                if (candidate.candidate == null) {
                    this.answer = this.peerConnection.localDescription;
                    console.log("Your answer is:", this.answer);
                    resolve(this.peerConnection.localDescription); // Resolve when ICE gathering is complete
                }
            };
        });
    }

    SetChannelOnOpenAction = (action) => {
        this.channel.SetOnOpenAction(action);
    }

    SetChannelOnMessageAction = (action) => {
        this.channel.SetRemoteStreamEventAction(action);
    }

    Send = (message) => {
        this.channel.Send(message);
    }
}

class PeerConnectionChannel {
    channel = null;
    pc = null;
    onOpenAction = () => console.log("Channel created!");
    remoteStreamEventAction = () => null;
    onErrorAction = (error) => console.log(error);

    constructor(peerConnection) {
        this.pc = peerConnection;
    }

    Create = (id, suffix) => {
        this.channel = this.pc.createDataChannel(
            `${id}-${suffix}`,
            {
                reliable: true
            }
        );
        this.channel.onopen = this.onOpenAction;
        this.channel.onmessage = this.MessageHandler;
        this.channel.onerror = this.onErrorAction;
    }

    Discover = () => {
        this.pc.ondatachannel = (event) => {
            this.channel = event.channel;
            this.channel.onopen = this.onOpenAction;
            this.channel.onmessage = this.MessageHandler;
            this.channel.onerror = this.onErrorAction;
        }
    }

    SetRemoteStreamEventAction = (action) => {
        this.remoteStreamEventAction = action;
    }

    MessageHandler = async (event) => {
        switch (event.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                await this.remoteStreamEventAction();
                break;
            default:
                break;
        }
    }

    SetOnOpenAction = async (action) => {
        this.onOpenAction = action;
    }

    Send = (message) => {
        if (!this.channel)
            return null;
        this.channel.send(JSON.stringify(message));
    }
}