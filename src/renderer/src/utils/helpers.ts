export const findFolder = (folders, parentId) => {
  const foundFolder = folders.filter((fold) => fold.folderid === parentId)[0];
  if (!foundFolder) {
    const foundNestedFolder = findFolder(folders.folders, parentId);
    if (foundNestedFolder) {
      return foundNestedFolder;
    }
  }
  return foundFolder;
};

export const returnAllFolders = (allData) => {
  const allFolders = [];
  const topLevel = allData.folders;
  allFolders.push(topLevel);
  for (const folder in allFolders) {
  }
};

export const returnAllNote = (allData) => {};
