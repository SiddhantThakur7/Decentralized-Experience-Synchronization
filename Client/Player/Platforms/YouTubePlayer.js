// YouTubePlayer.js
class YouTubePlayer {
    #playingStateChangeAction = () => pass;
    #seekAction = () => pass;
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

    // publicly accessible methods

    instantiate = async () => {
        this.#player = await this.#throttledRetry(this.#getPlayerReference);
        console.log(this.#player);
    }

    setplayingStateChangeAction = (action) => {
        this.#playingStateChangeAction = action;
    }

    setseekAction = (action) => {
        this.#seekAction = action;
    }

    setplayingStateChangeListener = () => {
        this.#player.onpause = this.#playingStateChangeAction;
        this.#player.onplay = this.#playingStateChangeAction;
    }

    setSeekListener = () => {
        this.#player.onseek = this.#seekAction;
    }

    seekTo = (timestamp) => {
        return this.#player.seek(timestamp);
    }

    play = () => {
        return this.#player.play();
    }

    pause = () => {
        return this.#player.pause();
    }

    currentTimestamp = () => {
        return this.#player.currentTime;
    }

    currentPlayState = () => {
        return !this.#player.paused;
    }
}
