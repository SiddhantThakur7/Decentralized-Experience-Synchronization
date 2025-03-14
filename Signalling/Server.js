class Server {
    apiEndpoint = null;
    constructor() {
        this.apiEndpoint = "https://decentralized-experience-synchronization.onrender.com"
    }

    createNewSession = async () => {
        try {
            const response = await fetch(`${this.apiEndpoint}/session/create`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`, response);
            }

            const result = await response.json();
            console.log(result);
            return result.sessionId;
        }
        catch (error) {
            console.error(error.message);
        }
    }

    answerConnectionRequest = async (sessionId, answer) => {
        const response = await fetch(`${this.apiEndpoint}/session/access/${sessionId}`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(answer),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`, response);
        }
    }
}

export default Server;