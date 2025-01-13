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

  const filteredShareRequests = shareRequests.map((shareReq) => {
    const shareRequest = { id: shareReq.shareReqId, email: "" };
    shareReq.userOne === userEmail
      ? (shareRequest.email = shareReq.userTwo)
      : (shareRequest.email = shareReq.userOne);
    return shareRequest;
  });

  // save for future filtering and sorting and placement
  // for now just send back untouched data
  // const filteredSharedNotes = sharedNotes.map((shareNote) => {
  // });

  self.postMessage({
    filteredConnections,
    filteredConnectionRequests,
    filteredShareRequests,
    filteredSharedNotes: sharedNotes
  });
};
