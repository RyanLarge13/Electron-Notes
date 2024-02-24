import Dexie from "dexie";

class LocalCache {
  db: Dexie;

  constructor() {
    this.db = new Dexie("localData");
    this.db.version(1).stores({
      user: "userId",
      folders: "folderid",
      notes: "noteid"
    });
  }

  async getAllDataFromStore(storeName: string) {
    try {
      const dataArray = await this.db[storeName].toArray();
      return dataArray;
    } catch (error) {
      console.log(`Error retrieving data from ${storeName}:`, error);
      throw error;
    }
  }

  async fetchAllLocalData(storeNames: string[]) {
    try {
      const promises = storeNames.map((storeName) => this.getAllDataFromStore(storeName));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.log("Error retrieving data from multiple stores:", error);
      throw error;
    }
  }

  async updateData(storeName, data) {
    try {
      const store = this.db[storeName];
      if (!store) {
        throw new Error(`Store "${storeName}" not found`);
      }
      await store.clear();
      try {
        if (data.length > 1) {
          await store.bulkAdd(data);
        } else {
          await store.add(data);
        }
      } catch (err) {
        console.log("error when adding data", err);
      }
      // console.log(`Data updated successfully in ${storeName}`);
    } catch (error) {
      console.error(`Error updating data in ${storeName}:`, error);
      throw error;
    }
  }
}

export default LocalCache;
