class Player {
    #player;

    constructor() {
        if (window.location.origin.includes('youtube')) {
            this.#player = new YouTubePlayer();
        } else if (window.location.origin.includes('netflix')) {
            this.#player = new NetflixPlayer();
        }
    }
    // publicly accessible methods

    instantiate = async () => {
        await this.#player.instantiate();
    }

    setplayingStateChangeListener = (action) => {
        this.#player.setplayingStateChangeAction(action);
        this.#player.setplayingStateChangeListener();
    }

    setSeekListener = (action) => {
        this.#player.setplayingSeekAction(action);
        this.#player.setSeekListener();
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
        return this.#player.currentTimestamp();
    }

    currentPlayState = () => {
        return this.#player.currentPlayState();
    }

    playFrom = (timestamp) => {
        this.pause();
        this.seekTo(timestamp);
        this.play();
    }

    pauseAt = (timestamp) => {
        this.pause();
        this.seekTo(timestamp);
    }
}
