import PeerEntity from "../Connections/PeerEntity.js";

var executionTimes = {};
window.addEventListener('load', async () => {
    await joinSession();
});

const joinSession = async () => {
    const name = window.name;
    const selfConnections = Number(name.split('-')[1]);
    const sessionId = localStorage.getItem('session_id');
    const offer = localStorage.getItem('offer_sdp');
    const offerIndex = localStorage.getItem('offer_index');
    let startTime = performance.now();
    const peer = await (new PeerEntity()).instantiate({
        sessionId,
        offer,
        offerIndex
    });
    const initialConnections = peer.connections.length;
    console.log(initialConnections, selfConnections);
    await new Promise((resolve) => {
        setInterval(() => {
            if (peer.connections.length - initialConnections === selfConnections) {
                resolve();
            }
        }, 50);
    });
    let endTime = performance.now();
    console.log(`Execution time for ${selfConnections} self connections: ${endTime - startTime} milliseconds`);
}
