// NetflixPlayer.js
class NetflixPlayer {
    #actor = true;
    #playingStateChangeAction = () => null;
    #seekAction = () => null;
    #player;
    #playerWrapper;

    constructor() { }

    #getPlayerReference = () => {
        let player = this.#playerWrapper.getVideoPlayerBySessionId(
            this.#playerWrapper.getAllPlayerSessionIds()[0]
        );
        console.log(player);
        return player?.getReady() ? player : null;
    }

    #getPlayerWrapperReference = () => {
        return window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
    }

    #throttledRetry = async (callback) => {
        for (let i = 0; i < 5; i++) {
            let result = callback();
            console.log(result, Boolean(result))
            if (result)
                return result;
            await this.#sleep(i * 500);
        }
        console.log("All retry attempts exhausted!");
    }

    #sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // publicly accessible methods

    instantiate = async () => {
        this.#playerWrapper = this.#getPlayerWrapperReference();
        this.#player = await this.#throttledRetry(this.#getPlayerReference);
    }

    setplayingStateChangeAction = (action) => {
        this.#playingStateChangeAction = action;
    }

    setSeekAction = (action) => {
        this.#seekAction = action;
    }

    setplayingStateChangeListener = () => {
        this.#player.addEventListener('playingchanged', this.#playingStateChangeAction);
    }

    setSeekListener = () => {
        return;
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
        return this.#player.getCurrentTime();
    }

    currentPlayState = () => {
        return this.#player.isPlaying();
    }
}
