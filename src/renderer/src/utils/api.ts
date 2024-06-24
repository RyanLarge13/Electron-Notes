import Axios from "axios";
import { AxiosResponse } from "axios";
// const devUrl = "http://localhost:8080";
const devUrl = "https://notesserver-production-9640.up.railway.app";

export const loginUser = (
  username: string,
  email: string,
  password: string
): Promise<AxiosResponse> => {
  const res = Axios.post(`${devUrl}/users/login`, { username, email, password });
  return res;
};

export const signupUser = (user: {
  username: string;
  email: string;
  password: string;
}): Promise<AxiosResponse> => {
  const res = Axios.post(`${devUrl}/users/signup`, { ...user });
  return res;
};

export const updateUsername = (username: string, token: string): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/users/update`,
    { newUsername: username, newEmail: null },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const updatePassword = (
  oldPass: string,
  newPass: string,
  token: string
): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/users/update/password`,
    { oldPassword: oldPass, newPassword: newPass },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const forgotCreds = (email: string): Promise<AxiosResponse> => {
  const res = Axios.post(`${devUrl}/users/forgotcreds`, { email: email });
  return res;
};

export const deleteUser = (token: string): Promise<AxiosResponse> => {
  const res = Axios.delete(`${devUrl}/users/delete`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};

export const getuserData = (token: string): Promise<AxiosResponse> => {
  const res = Axios.get(`${devUrl}/users/seperated/data`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};

export const createNewFolder = (
  token: string,
  data: { title: string; color: string; parentFolderId: string }
): Promise<AxiosResponse> => {
  const res = Axios.post(
    `${devUrl}/folders/create`,
    {
      title: data.title,
      color: data.color,
      parentFolderId: data.parentFolderId
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res;
};

export const updateFolder = (token: string, folder): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/folders/update`,
    { ...folder },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const moveManyFolders = (
  token: string,
  foldersArr: string[],
  newParentId: string
): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/folders/moveall`,
    { folderArray: foldersArr, newParentId: newParentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const duplicateMultipleContents = (
  token: string,
  newFolders,
  newNotes
): Promise<AxiosResponse> => {
  const res = Axios.post(
    `${devUrl}/folders/dup/multiple`,
    { newFolders: newFolders, newNotes: newNotes },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

// export const updateMultiFolders = (token, folders, newFolderId) => {};

// export const updateMultiNotes = (token, notes, newFolderId) => {};

export const deleteAFolder = (token: string, folderId: string): Promise<AxiosResponse> => {
  const res = Axios.delete(`${devUrl}/folders/delete/${folderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};

export const deleteMultipleFolders = (
  token: string,
  folderIds: string[]
): Promise<AxiosResponse> => {
  const res = Axios.delete(`${devUrl}/folders/multiple/delete`, {
    data: {
      folderIds: folderIds
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  return res;
};

export const createNewNote = (
  token: string,
  note: { title: string; htmlNotes: string; folderId: string }
): Promise<AxiosResponse> => {
  const res = Axios.post(
    `${devUrl}/notes/create`,
    { ...note },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return res;
};

export const updateNote = (
  token: string,
  note: { notesId: string; htmlNotes: string; locked: boolean; title: string; folderId: string }
): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/notes/update`,
    { ...note },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const moveNoteToTrash = (
  token: string,
  noteId: string,
  trashedBool: boolean
): Promise<AxiosResponse> => {
  const res = Axios.patch(
    `${devUrl}/notes/movetotrash`,
    { noteId, trashedBool },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const deleteANote = (token: string, noteId: string): Promise<AxiosResponse> => {
  const res = Axios.delete(`${devUrl}/notes/delete/${noteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};

export const createConRequest = (token: string, email: string): Promise<AxiosResponse> => {
  const res = Axios.post(
    `${devUrl}/connect/create/request`,
    { userEmail: email },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const acceptRequestConnection = (
  token: string,
  requestId: string,
  userEmail: string
): Promise<AxiosResponse> => {
  const res = Axios.post(
    `${devUrl}/connect/create`,
    {
      requestId,
      userEmail
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};
