class Server {
    apiEndpoint = null;
    constructor() {
        this.apiEndpoint = "http://localhost:8080"
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

    answerConnectionRequest = async (answer) => {
        const response = await fetch(`${this.apiEndpoint}/session/create`, {
            method: "POST",
            body: JSON.stringify(answer),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`, response);
        }
    }
}