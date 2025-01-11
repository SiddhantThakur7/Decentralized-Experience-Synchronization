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
        return this;
    }

    setplayingStateChangeListener = (action) => {
        this.#player.setplayingStateChangeAction(action);
        this.#player.setplayingStateChangeListener();
    }

    setSeekListener = (action) => {
        this.#player.setSeekAction(action);
        this.#player.setSeekListener();
    }

    setPostEventAction = (action) => {
        this.#player.setPostEventAction(action);
    }

    seekTo = (timestamp) => {
        return this.#player.seekTo(timestamp);
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
