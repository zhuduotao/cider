import * as localforage from "localforage";

const NAMESPACE = 'CIDER:CONFIG:'

class ConfigStorage {

  private constructor() {}

  public static async save<T>(key:string,data: T) {
    key = `${NAMESPACE}${key}`
    if(chrome?.storage?.local) {
      await chrome.storage.local.set({[key]:data})
    } else {
      await localforage.setItem(key,data)
    }
  }

  public static async load<T>(key:string): Promise<T>{
    key = `${NAMESPACE}${key}`
    if(chrome?.storage?.local) {
      const data = await chrome.storage.local.get([key])
      return data[key] as T
    } else {
      return (await localforage.getItem(key)) as T
    }
  }

}
export default ConfigStorage;