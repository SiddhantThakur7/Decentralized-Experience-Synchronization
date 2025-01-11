// YouTubePlayer.js
class YouTubePlayer {
    #actor = true;
    #playingStateChangeAction = () => null;
    #seekAction = () => null;
    #postEventAction = () => null;
    #player;

    constructor() { }

    #getPlayerReference = () => {
        let p = document.querySelector("video");
        console.log(p, p?.isConnected);
        return p?.isConnected ? p : null;
    }

    #throttledRetry = async (callback) => {
        for (let i = 0; i < 5; i++) {
            let result = callback();
            if (result)
                return result;
            await this.#sleep(i * 500);
        }
        console.log("Done");
    }

    #sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    #unsetActor = () => {
        this.#actor = false;
    }

    // publicly accessible methods
    instantiate = async () => {
        this.#player = await this.#throttledRetry(this.#getPlayerReference);
    }

    setplayingStateChangeAction = (action) => {
        this.#playingStateChangeAction = () => {
            action();
            if (this.#actor) {
                this.#postEventAction();
            }
            this.#actor = true;
        };
    }

    setSeekAction = (action) => {
        this.#seekAction = () => {
            action();
            if (this.#actor) {
                this.#postEventAction();
            }
            this.#actor = true;
        };
    }

    setPostEventAction = (action) => {
        this.#postEventAction = action;
    }

    setplayingStateChangeListener = () => {
        this.#player.onpause = this.#playingStateChangeAction;
        this.#player.onplay = this.#playingStateChangeAction;
    }

    setSeekListener = () => {
        this.#player.onseek = this.#seekAction;
    }

    seekTo = (timestamp) => {
        this.#unsetActor();
        return this.#player.currentTime = timestamp;
    }

    play = () => {
        this.#unsetActor();
        return this.#player.play();
    }

    pause = () => {
        this.#unsetActor();
        return this.#player.pause();
    }

    currentTimestamp = () => {
        return this.#player.currentTime;
    }

    currentPlayState = () => {
        return !this.#player.paused;
    }
}
