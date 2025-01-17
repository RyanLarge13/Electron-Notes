// handleConnectionsWorker.js
self.onmessage = (event) => {
  // Data returned from server and sent over
  const { connections, connectionRequests, shareRequests, sharedNotes, userEmail } = event.data;

  // Return the connection the user has with other users in an easy format {id: string, email: string}
  const filteredConnections = connections.map((con) => {
    const connection = { id: con.conid, email: "" };
    con.userOne === userEmail ? (connection.email = con.userTwo) : (connection.email = con.userOne);
    return connection;
  });

  let connectionRequestsReceived = [];
  let connectionRequestsSent = [];

  connectionRequests.map((conReq) => {
    if (conReq.userOne === userEmail) {
      const req = { id: conReq.id, to: conReq.userTwo, from: conReq.userOne };
      connectionRequestsSent.push(req);
    } else {
      const req = { id: conReq.id, to: conReq.userOne, from: conReq.userTwo };
      connectionRequestsReceived.push(req);
    }
  });

  let filteredShareRequests = [];
  let filteredShareRequestsFrom = [];

  shareRequests.map((shareReq) => {
    if (shareReq.userOne === userEmail) {
      filteredShareRequestsFrom.push({
        id: shareReq.id,
        to: shareReq.userTwo,
        from: shareReq.userOne,
        note: shareReq.noteId
      });
    } else {
      filteredShareRequests.push({
        id: shareReq.id,
        from: shareReq.userOne,
        two: shareReq.userTwo
      });
    }
  });

  console.log(connectionRequests);

  // save for future filtering and sorting and placement
  // for now just send back untouched data
  // const filteredSharedNotes = sharedNotes.map((shareNote) => {
  // });

  self.postMessage({
    filteredConnections,
    connectionRequestsSent,
    connectionRequestsReceived,
    filteredShareRequestsFrom,
    filteredShareRequests,
    filteredSharedNotes: sharedNotes
  });
};
