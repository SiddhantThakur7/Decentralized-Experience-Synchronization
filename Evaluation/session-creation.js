import PeerEntity from "../Connections/PeerEntity.js";

var windowCount = 0;
var executionTimes = {};
var sessionId = null;
window.addEventListener('load', async () => {
    document.getElementById('create-session').addEventListener('click', async () => await sessionHostTestHandler());
    document.getElementById('add-peer').addEventListener('click', async () => await addPeerToSessionHandler());
});

const sessionHostTestHandler = async (close = true) => {
    const peers = Number(document.getElementById('peers').value);
    let startTime = performance.now();
    const peer = await (new PeerEntity()).instantiate('');
    await peer.CreateSessionRequest(peers);
    let endTime = performance.now();
    let executionTime = endTime - startTime;
    console.log(`Execution time for ${peers} peers capacity: ${executionTime} milliseconds`);
    if (close) {
        peer.connections.forEach(connection => {
            connection.peerConnection.close();
        });
    }
    executionTimes[peers] = executionTime;
    console.log(executionTimes);
    return peer.session.sessionId;
};

const addPeerToSessionHandler = async () => {
    if (!sessionId) {
        sessionId = await sessionHostTestHandler(false);
    }
    const path = 'http://localhost:8080/session/access/' + sessionId;
    try {
        const response = await fetch(path, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`, response);
        }

        const result = (await response.text())
            .replace(/value=([^"'\s>]+)/g, 'value="$1"')
            .replace(/type=\s*"?\s*hidden\s*"?/g, 'type="hidden"');
        var resultDocument = new DOMParser().parseFromString(result, "text/html");
        const offerSdp = resultDocument.getElementById('offer-sdp').value;
        const offerIndex = resultDocument.getElementById('offer-index').value;
        localStorage.setItem('session_id', sessionId);
        localStorage.setItem('offer_sdp', offerSdp);
        localStorage.setItem('offer_index', offerIndex);
        window.open('http://localhost:8888/inclusion', `newWindow-${windowCount++}`, "width=400,height=300");
    }
    catch (error) {
        console.error(error.message);
    }
};


async function monitorOverhead(peerConnection) {
    let prevBytesSent = 0;
    let prevBytesReceived = 0;
    let maxDownloadBytes = 0;
    let maxUploadBytes = 0;
    let count = 0;
    let completed = false;

    const intervalId = setInterval(async () => {
        if (!peerConnection) return;

        let totalBytesSent = 0;
        let totalBytesReceived = 0;

        const stats = await peerConnection.getStats();

        stats.forEach(report => {
            // Look for relevant network-related stats
            if (report.type === "candidate-pair" && report.bytesSent) {
                totalBytesSent += report.bytesSent;
            }
            if (report.type === "candidate-pair" && report.bytesReceived) {
                totalBytesReceived += report.bytesReceived;
            }
        });

        // Calculate bandwidth usage per second
        const sentDelta = totalBytesSent - prevBytesSent;
        const receivedDelta = totalBytesReceived - prevBytesReceived;

        prevBytesSent = totalBytesSent;
        prevBytesReceived = totalBytesReceived;

        maxDownloadBytes = Math.max(maxInputBytes, receivedDelta);
        maxUploadBytes = Math.max(maxUploadBytes, sentDelta);

        console.log(`Overhead Sent: ${sentDelta} bytes/sec | Max: ${maxUploadBytes} bytes/sec`);
        console.log(`Overhead Received: ${receivedDelta} bytes/sec | Max: ${maxDownloadBytes} bytes/sec`);

        if (count >= 60) {
            clearInterval(intervalId);
            console.log('Monitoring stopped after 60 executions');
            completed = true;
        }
    }, 1000); // Monitor every second

    await new Promise((resolve) => setInterval(() => {
        if (completed) {
            resolve();
        }
    }, 50))
    return { maxDownloadBytes, maxUploadBytes };
}