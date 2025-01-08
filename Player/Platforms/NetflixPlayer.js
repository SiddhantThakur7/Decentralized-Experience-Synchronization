// NetflixPlayer.js
class NetflixPlayer {
    #actor = true;
    #playingStateChangeAction = () => null;
    #seekAction = () => null;
    #postEventAction = () => null;
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

    #unsetActor = () => {
        this.#actor = false;
    }

    // publicly accessible methods

    instantiate = async () => {
        this.#playerWrapper = this.#getPlayerWrapperReference();
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

    setseekAction = (action) => {
        this.#seekAction = () => {
            action();
            if (this.#actor) {
                this.#postEventAction();
            }
            this.#actor = true;
        };
    }

    setplayingStateChangeListener = () => {
        this.#player.addEventListener('playingchanged', this.#playingStateChangeAction);
    }

    setPostEventAction = (action) => {
        this.#postEventAction = action;
    }

    setSeekListener = () => {
        return;
    }

    seekTo = (timestamp) => {
        this.#unsetActor()
        return this.#player.seek(timestamp);
    }

    play = () => {
        this.#unsetActor()
        return this.#player.play();
    }

    pause = () => {
        this.#unsetActor()
        return this.#player.pause();
    }

    currentTimestamp = () => {
        return this.#player.getCurrentTime();
    }

    currentPlayState = () => {
        return this.#player.isPlaying();
    }
}
