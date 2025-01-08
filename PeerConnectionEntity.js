class PeerConnectionEntity {
    offer = null;
    answer = null;
    peerConnection = null;
    channel = null;
    isPrimary = false;

    servers = {
        iceServers: [
            {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
            },
        ],
        iceCandidatePoolSize: 10,
    };

    constructor(isPrimary = false){
        this.peerConnection = new RTCPeerConnection(servers);
        this.channel = new PeerConnectionChannel();
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
        this.offer = offerDescription;
        await this.SetLocalDescription(offerDescription);
        this.peerConnection.onicecandidate = (candidate) => {
            if (candidate.candidate == null) {
                console.log("Your offer is:", JSON.stringify(this.peerConnection.localDescription), `id=${id}, suffix=${suffix}`);
            }
        }
    }

    Answer = async (remoteSdp) => {
        if (this.peerConnection.remoteDescription){
            return
        }
        const remoteDescription = new RTCSessionDescription(remoteSdp);
        this.channel.Discover();
        await SetRemoteDescription(remoteDescription);
        if (this.offer) {
            this.answer = remoteDescription;
            return
        } else {
            this.offer = remoteDescription;
        }
        const answerDescription = await this.peerConnection.createAnswer();
        this.answer = answerDescription;
        await SetLocalDescription(answerDescription);
        pc.onicecandidate = function (candidate) {
            if (candidate.candidate == null) {
                console.log("answer: ", JSON.stringify(this.peerConnection.localDescription));
            }
        }
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
    #pc = null;
    #messageAction = () => {};
    #openingAction = () => {};
    #errorAction = (error) => console.log(error);

    constructor (peerConnection) {
        this.#pc = peerConnection;
    }

    Create = (id, suffix) => {
        this.channel = this.#pc.createDataChannel(
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
        this.#pc.ondatachannel = (event) => {
            this.channel = event.channel;
        }
        this.channel.onopen = this.#openingAction;
        this.channel.onmessage = this.#messageAction;
        this.channel.onerror = this.#errorAction;
    }

    SetMessageAction = async (action) => {
        this.#messageAction = action;
    }

    SetOpeningAction = async (action) => {
        this.#openingAction = action;
    }
}