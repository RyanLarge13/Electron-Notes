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

  const filteredConnectionRequests = connectionRequests.map((conReq) => {
    const connectionReq = { id: conReq.conreqid, email: "" };
    conReq.userOne === userEmail
      ? (connectionReq.email = conReq.userTwo)
      : (connectionReq.email = conReq.userOne);
    return connectionReq;
  });

  let filteredShareRequests = [];
  let filteredShareRequestsFrom = [];

  shareRequests.map((shareReq) => {
    if (shareReq.userOne === userEmail) {
      filteredShareRequestsFrom.push({
        id: shareReq.id,
        to: shareReq.userTwo,
        from: shareReq.userOne,
        note: shareReq.note
      });
    } else {
      filteredShareRequests.push({
        id: shareReq.id,
        from: shareReq.userOne,
        two: shareReq.userTwo,
        note: shareReq.note
      });
    }
  });

  console.log(shareRequests);

  // save for future filtering and sorting and placement
  // for now just send back untouched data
  // const filteredSharedNotes = sharedNotes.map((shareNote) => {
  // });

  self.postMessage({
    filteredConnections,
    filteredConnectionRequests,
    filteredShareRequestsFrom,
    filteredShareRequests,
    filteredSharedNotes: sharedNotes
  });
};
