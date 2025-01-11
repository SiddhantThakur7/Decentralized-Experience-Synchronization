class PeerConnectionEntity {
    offer = null;
    answer = null;
    peerConnection = null;
    channel = null;
    isPrimary = false;

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
        this.offer = this.peerConnection.localDescription;
        this.peerConnection.onicecandidate = (candidate) => {
            if (candidate.candidate == null) {
                console.log("Your offer is:", this.offer, `id=${id}, suffix=${suffix}`);
            }
        }
        return this.peerConnection.localDescription;
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
        this.answer = this.peerConnection.localDescription;
        this.peerConnection.onicecandidate = function (candidate) {
            if (candidate.candidate == null) {
                console.log("answer: ", this.answer);
            }
        }
        return this.peerConnection.localDescription;
    }

    SetChannelOpeningAction = (action) => {
        this.channel.SetOpeningAction(action);
    }

    SetChannelMessageAction = (action) => {
        this.channel.SetMessageAction(action);
    }
}

class PeerConnectionChannel {
    channel = null;
    pc = null;
    #messageAction = () => null;
    #openingAction = () => null;
    #errorAction = (error) => console.log(error);

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
        this.channel.onopen = this.#openingAction;
        this.channel.onmessage = this.#messageAction;
        this.channel.onerror = this.#errorAction;
    }

    Discover = () => {
        this.pc.ondatachannel = (event) => {
            this.channel = event.channel;
            this.channel.onopen = this.#openingAction;
            this.channel.onmessage = this.#messageAction;
            this.channel.onerror = this.#errorAction;
        }
    }

    SetMessageAction = async (action) => {
        this.#messageAction = action;
    }

    SetOpeningAction = async (action) => {
        this.#openingAction = action;
    }
}