class Player {
    #player;
    #postEventAction;
    actor = false;

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

    toggledActorAction = (action) => {
        this.actor = false;
        action();
        this.actor = true;
    }

    setplayingStateChangeListener = (action) => {
        this.#player.setplayingStateChangeAction(() => {
            if (action) action();
            if (this.actor) this.#postEventAction();
        });
        this.#player.setplayingStateChangeListener();
    }

    setSeekListener = (action) => {
        this.#player.setSeekAction(() => {
            if (action) action();
            if (this.actor) this.#postEventAction();
        });
        this.#player.setSeekListener();
    }

    setPostEventAction = (action) => {
        this.#postEventAction = action;
    }

    seekTo = (timestamp) => {
        this.toggledActorAction(() => this.#player.seekTo(timestamp));
    }

    play = () => {
        this.toggledActorAction(this.#player.play);
    }

    pause = () => {
        this.toggledActorAction(this.#player.pause);
    }

    currentTimestamp = () => {
        return this.#player.currentTimestamp();
    }

    currentPlayState = () => {
        return this.#player.currentPlayState();
    }

    playFrom = (timestamp) => {
        this.seekTo(timestamp);
        this.play();
    }

    pauseAt = (timestamp) => {
        this.pause();
        this.seekTo(timestamp);
    }
}
