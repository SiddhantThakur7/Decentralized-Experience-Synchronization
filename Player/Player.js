import YouTubePlayer from './Platforms/YouTubePlayer.js';
import NetflixPlayer from './Platforms/NetflixPlayer.js';

class Player {
    #player;
    #postEventAction;
    actor = true;

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

    disabledActorAction = (action) => {
        this.actor = false;
        action();
    }

    setplayingStateChangeListener = (action) => {
        this.#player.setplayingStateChangeAction(() => {
            if (action) action();
            if (this.actor) this.#postEventAction()
            this.actor = true;
        });
        this.#player.setplayingStateChangeListener();
    }

    setSeekListener = (action) => {
        this.#player.setSeekAction(() => {
            if (action) action();
            if (this.actor) this.#postEventAction();
            this.actor = true;
        });
        this.#player.setSeekListener();
    }

    setPostEventAction = (action) => {
        this.#postEventAction = action;
    }

    seekTo = (timestamp) => {
        this.disabledActorAction(() => this.#player.seekTo(timestamp));
    }

    play = () => {
        this.disabledActorAction(this.#player.play);
    }

    pause = () => {
        this.disabledActorAction(this.#player.pause);
    }

    currentTimestamp = () => {
        return this.#player.currentTimestamp();
    }

    currentPlayState = () => {
        return this.#player.currentPlayState();
    }

    playFrom = (timestamp) => {
        this.disabledActorAction(() => {
            this.seekTo(timestamp);
            this.play();
        });
    }

    pauseAt = (timestamp) => {
        this.disabledActorAction(() => {
            this.pause();
            this.seekTo(timestamp);
        });
    }
}

export default Player;