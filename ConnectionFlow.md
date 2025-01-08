# Signalling Flow
When a new session is created:
- The client at which it is created will become the primary and establish a fresh socket connection with the Signalling Server
- A unique session link is created for which the signalling server will have a specific memory partition
- The primary client will then create and share 4 offers to signalling server
- The signaling server will maintain this info in an in-memory cache for faster retreival by other clients
- A distributed counter will be created which maintains the count of the offers consumed out of the 4 found.

When a client tries to join a session:
- The client will access the link shared by the primary through their own browser which will hit the signalling server.
- At this point the Signalling server renders a loading page on this client's browser with hidden fields containing a session-information and a specific un-used offer packet from the primary.
- The client will then access these hidden DOM element data to create their own connection instances and create an answer sdp.
- The answer sdp will be sent to the Signalling Server via a POST request, and will be mapped to the offer used and saved on the signalling cache.
- The answer sdp will trigger a message over the socket connection to the primary to share this answer over to the primary for completing the handshake.  


# Signalling Server

## Routes
    - GET /:sessionId -> render the loading page with the session and primary's offer info along and redirect to the target url
    - POST /:sessionId -> Map the answer with the offer used
    - ws://[:sessionId] -> get primary's offers to the server, get each offer's answer to the primary for handshake completion

## Model
- Session
    - connections
        - offer
        - answer

Session: {
    sessionId: id,
    connections: [
        {offer: 'sdp1', answer: null},
        {offer: 'sdp2', answer: null}
    ]
}

Think about distributed transactions to ensure same offer is not used for across multiple peers
    1. randomized offer index -> everytime return a random offer index data with a lower collision rate (can have additional offers to reduce chances of collisions further)
    2. distributed counter -> maintains a count of consumed offer instances

    For a single threaded case, locking will work


- POST /:sessionId
{
    sessionId: 'hxvytzhsdsodo12398867',
    offer: 'sdp1',
    answer: 'remote-sdp1'
}

- ws://[:sessionId]
Client -> Server (on user session creation)
{
    sessionId: 'hxvytzhsdsodo12398867',
    connections: [
        {offer:'sdp1' , answer: null},
        {offer:'sdp2' , answer: null}
    ]
}
Server -> Client (on answer)
{
    connections: [
        {offer:'sdp1' , answer: "remote-sdp1'},
        {offer:'sdp2' , answer: "remote-sdp2'}
    ]
}

The rest of mesh topology will be created through SFU -> primary acting as a central point of connection asset transfer
The primary has information about currently joined peers, every time a new peer is connected to primary, the primary requests an offer from the new peer for each of the peers that joined before the new peer.

primary = p
States
[] -> no peers, topology is complete (p1)
[p1] -> p1 connects to p. No peers joined before p1, topology is complete ((p,p1))
[p1, p2] -> p2 connects to p. p1 joined before p2, topology is incomplete ((p, p1), (p, p2))
    p requests offer from p2 and sends to p1 and requests an answer from p1 and sends to p2.
    topology complete ((p, p1), (p, p2), (p1, p2))
[p1, p2, p3] -> p3 connects to p. p1, p2 joined before p3, topology is incomplete ((p, p1), (p, p2), (p1, p2), (p, p3))
    p requests offers for both p1 & p2 from p3 and sends answers from p1 & p2 to p3.
    topology complete ((p, p1), (p, p2), (p1, p2), (p, p3), (p1, p3), (p2, p3))

Total Number of connections = Total Number of data channels => NC2 where N is the number of clients
2C2 = 1; 3C2 = 3, 4C2 = 6
Total Number of socket connections = 1 from N
Number of server events = N + 1 => 1 event for offer accumulation, and N events for answer communication and handshaking completion