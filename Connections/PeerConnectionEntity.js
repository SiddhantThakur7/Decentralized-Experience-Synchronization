import Constants from '../Constants/Constants.js';

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
            console.log("Connection state changed to:", this.peerConnection.connectionState);
            this.connected = this.peerConnection.connectionState == 'connected';
            if (this.connected) {
                console.log("Peer connection established!");
            }
        });
        // Add empty tracks
            this.addEmptyTracks();
    }

    addEmptyTracks = () => {
        const emptyAudioTrack = this.createEmptyTrack('audio');
        const emptyVideoTrack = this.createEmptyTrack('video');
        this.peerConnection.addTrack(emptyAudioTrack);
        this.peerConnection.addTrack(emptyVideoTrack);
    }

    createEmptyTrack = (kind) => {
        if (kind === 'audio') {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            return dst.stream.getAudioTracks()[0];
        } else if (kind === 'video') {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const stream = canvas.captureStream();
            return stream.getVideoTracks()[0];
        }
    }

    replaceTrack = (track) => {
        const senders = this.peerConnection.getSenders().find(sender => sender.track.kind === track.kind);
        senders.replaceTrack(track);
        //log connections to see if the track was replaced
        console.log('Connections after track replacement:', this.peerConnection.getSenders());
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
        return this;
    }

    SetChannelOnMessageAction = (action) => {
        this.channel.SetOnMessageAction(action);
        return this;
    }

    SetChannelOnCloseAction = (action) => {
        this.channel.SetOnCloseAction(action);
        return this;
    }

    Send = (message) => {
        this.channel.Send(message);
    }
}

class PeerConnectionChannel {
    channel = null;
    pc = null;
    onOpenAction = () => console.log("Channel created!");
    onMessageAction = () => null;
    onCloseAction = () => null;
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
        this.channel.onmessage = this.onMessageAction;
        this.channel.onerror = this.onErrorAction;
        this.channel.onclose = this.onCloseAction;

        // // Add empty tracks
        // this.addEmptyTracks();
    }

    Discover = () => {
        this.pc.ondatachannel = (event) => {
            this.channel = event.channel;
            this.channel.onopen = this.onOpenAction;
            this.channel.onmessage = this.onMessageAction;
            this.channel.onerror = this.onErrorAction;
            this.channel.onclose = this.onCloseAction;

            // // Add empty tracks
            // this.addEmptyTracks();
        }
    }

    addEmptyTracks = () => {
        const emptyAudioTrack = this.createEmptyTrack('audio');
        const emptyVideoTrack = this.createEmptyTrack('video');
        this.pc.addTrack(emptyAudioTrack);
        this.pc.addTrack(emptyVideoTrack);
    }

    createEmptyTrack = (kind) => {
        if (kind === 'audio') {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            return dst.stream.getAudioTracks()[0];
        } else if (kind === 'video') {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const stream = canvas.captureStream();
            return stream.getVideoTracks()[0];
        }
    }

    replaceTrack = (track) => {
        const senders = this.pc.getSenders().find(sender => sender.track.kind === track.kind);
        senders.replaceTrack(track);
        //logging connections to see if the track was replaced
        console.log('Connections after track replacement:', this.pc.getSenders());
    }

    SetOnOpenAction = (action) => {
        this.onOpenAction = async () => await action();
    }

    SetOnMessageAction = (action) => {
        this.onMessageAction = async (event) => await action(JSON.parse(event.data));
    }

    SetOnCloseAction = (action) => {
        this.onCloseAction = async () => await action();
    }

    Send = (message) => {
        if (!this.channel)
            return null;
        this.channel.send(JSON.stringify(message));
    }
}

export default PeerConnectionEntity;