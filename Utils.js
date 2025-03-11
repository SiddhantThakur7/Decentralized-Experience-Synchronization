class Utils {
    static sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static throttledRetry = async (callback) => {
        for (let i = 0; i < 5; i++) {
            let result = callback();
            if (result)
                return result;
            await this.sleep(i * 500);
        }
        console.log("All retry attempts exhausted!");
    }
}

export default Utils;