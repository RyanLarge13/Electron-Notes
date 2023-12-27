import Axios from "axios";
import { AxiosResponse } from "axios";
// const devUrl = "http://localhost:8080";
const devUrl = "https://notes-server-s05q.onrender.com";

export const loginUser = (
  username: string,
  email: string,
  password: string
): Promise<AxiosResponse> => {
  const res = Axios.post(`${devUrl}/users/login`, { username, email, password });
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

export const createNewFolder = (token: string, data) => {
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

export const updateFolder = (token, folder) => {
  const res = Axios.patch(
    `${devUrl}/folders/update`,
    { ...folder },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const deleteAFolder = (token, folderId) => {
  const res = Axios.delete(`${devUrl}/folders/delete/${folderId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};

export const deleteMultipleFolders = (token, folderIds) => {
  const res = Axios.delete(`${devUrl}/folders/multiple/delete`, {
    data: {
      folderIds: folderIds
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  return res;
};

export const createNewNote = (token: string, note) => {
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

export const updateNote = (token, note) => {
  const res = Axios.patch(
    `${devUrl}/notes/update`,
    { ...note },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res;
};

export const deleteANote = (token, noteId) => {
  const res = Axios.delete(`${devUrl}/notes/delete/${noteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res;
};
