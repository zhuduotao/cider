import {BaseMessage, mapStoredMessageToChatMessage, StoredMessage} from "@langchain/core/messages";
import * as localforage from "localforage";
import {STORAGE_KEY} from "@/constants/config_keys.ts";
import {AgiProviderConfigItem} from "@/pages/settings/tabs/agi/types.ts";
import {isEqual} from "lodash-es";
import ConfigFileBoundChatMessageHistory from "./ConfigFileBoundChatMessageHistory.ts";

interface StoragedMessageHistory {
  config: AgiProviderConfigItem,
  messages: StoredMessage[]
}

export class LocalForageChatMessageHistory extends ConfigFileBoundChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "localstorage"];


  private usingConfigFile: AgiProviderConfigItem | null = null;
  private messages: BaseMessage[] = [];
  private cacheKey: string

  private inited = false;

  constructor(sessionId: string) {
    // eslint-disable-next-line prefer-rest-params
    super();
    this.cacheKey = `${STORAGE_KEY.CHAT_HISTORY_PREFIX}:SESSION_HISTORY:${sessionId}`
    this.messages = [];
    this.usingConfigFile;
  }

  public async init(
    configForCreate: AgiProviderConfigItem,
  ): Promise<{
    acceptNewConfig: boolean;
  }> {
    const storage = await this.getStorage();
    if(storage) {
      this.usingConfigFile = storage.config;
      this.messages = storage.messages.map((p: StoredMessage)=>mapStoredMessageToChatMessage(p))
      this.inited = true;
      return  {acceptNewConfig: false}
    }
    this.usingConfigFile = configForCreate;
    await this.updateStorage();
    this.inited = true;
    return {acceptNewConfig: true}
  }

  private initCheck() {
    if(!this.inited) {
      throw new Error('Please call init() first')
    }
  }

  async getMessages(): Promise<BaseMessage[]> {
    this.initCheck()
    return this.messages;
  }

  async addMessage(message: BaseMessage) {
    this.initCheck()
    this.messages.push(message);
    await this.updateStorage();
  }

  async clear() {
    this.initCheck()
    this.messages = [];
    await this.updateStorage();
  }

  private async getStorage(): Promise<StoragedMessageHistory | null> {
    return await localforage.getItem(this.cacheKey)
  }

  private async updateStorage() {
    const inDiskData = await this.getStorage();
    if(inDiskData) {
      if(!isEqual(this.usingConfigFile, inDiskData.config)) {
        throw new Error('The config file has been changed, could not append to this session')
      }
    }
    await localforage.setItem(this.cacheKey,{
      config: this.usingConfigFile,
      messages: this.messages.map(p=>p.toDict())
    })
  }

  public getBoundConfig() {
    return this.usingConfigFile!;
  }
}