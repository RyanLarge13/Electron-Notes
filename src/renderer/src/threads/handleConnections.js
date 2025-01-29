// handleConnectionsWorker.js
self.onmessage = (event) => {
  // Data returned from server and sent over
  const { connections, connectionRequests, shareRequests, sharedNotes, userEmail } = event.data;

  // Return the connection the user has with other users in an easy format {id: string, email: string}
  const filteredConnections = connections.map((con) => {
    const connection = { id: con.conid, email: "", userId: "" };
    if (con.userOne === userEmail) {
      connection.email = con.userTwo;
      connection.userId = con.idTwo;
    } else {
      connection.email = con.userOne;
      connection.userId = con.idOne;
    }
    return connection;
  });

  let connectionRequestsReceived = [];
  let connectionRequestsSent = [];

  connectionRequests.map((conReq) => {
    if (conReq.userOne === userEmail) {
      const req = { id: conReq.conreqid, to: conReq.userTwo, from: conReq.userOne };
      connectionRequestsSent.push(req);
    } else {
      const req = { id: conReq.conreqid, to: conReq.userTwo, from: conReq.userOne };
      connectionRequestsReceived.push(req);
    }
  });

  let filteredShareRequests = [];
  let filteredShareRequestsFrom = [];

  shareRequests.map((shareReq) => {
    if (shareReq.userOne === userEmail) {
      filteredShareRequestsFrom.push({
        id: shareReq.shareReqId,
        to: shareReq.userTwo,
        from: shareReq.userOne,
        note: shareReq.note
      });
    } else {
      filteredShareRequests.push({
        id: shareReq.shareReqId,
        from: shareReq.userOne,
        to: shareReq.userTwo,
        note: shareReq.note
      });
    }
  });

  // save for future filtering and sorting and placement
  // for now just send back untouched data
  // const filteredSharedNotes = sharedNotes.map((shareNote) => {
  // });

  let filteredSharedNotes = [];
  sharedNotes.forEach((note) => {
    filteredSharedNotes.push({
      title: note.sharednotetitle,
      noteid: note.sharednoteid,
      locked: note.sharednotelocked,
      htmlText: note.sharednotehtmltext,
      folderId: note.sharednotefolderid,
      createdAt: new Date(note.sharednotecreatedat),
      updated: new Date(note.sharednoteupdated),
      trashed: note.sharednotetrashed,
      favorite: false,
      isNew: false,
      from: note.from
    });
  });

  self.postMessage({
    filteredConnections,
    connectionRequestsSent,
    connectionRequestsReceived,
    filteredShareRequestsFrom,
    filteredShareRequests,
    filteredSharedNotes: filteredSharedNotes
  });
};
