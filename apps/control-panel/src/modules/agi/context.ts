import {BehaviorSubject, ReplaySubject, Subject, Subscription} from "rxjs";
import {MessageChunk} from "./types.ts";
import {AgiService, AgiServiceSession} from "./agi-service.ts";
import {BaseMessage, HumanMessage} from "@langchain/core/messages";
import SupportedProviders from "./providers";
import ConfigStorage from "../storage/config-storage.ts";
import {cloneDeep, get, isEqual} from "lodash-es";
import {SettingChangedSubjection} from "@/subjects.ts";
import {LocalForageChatMessageHistory} from "./history/LocalForageChatMessageHistory.ts";
import {STORAGE_KEY} from "@/constants/config_keys.ts";
import {EMPTY_AGI_PROVIDER, MESSAGE_SCOPE_AGI_PROVIDER_CHANGED} from "@/constants.ts";
import {AgiProviderConfigItem} from "@/pages/settings/tabs/agi/types.ts";
import AgiHelper from "@/modules/agi/index.ts";
import ConfigFileBoundChatMessageHistory from "@/modules/agi/history/ConfigFileBoundChatMessageHistory.ts";

export type AiContextMessage = {
  action:  'notReady'|'providerReloaded'
}

class Context {

  private static _instance = new Context();

  private _agiService: AgiService | null = null;

  private _currentAgiServiceConfig : AgiProviderConfigItem | null = null;


  private readonly _messageStreamSubject : Subject<MessageChunk>  = new ReplaySubject<MessageChunk>(0);
  private readonly _subject : Subject<AiContextMessage> = new BehaviorSubject<AiContextMessage>({action: 'notReady'})

  private sessionMap : Map<string, ConfigFileBoundChatMessageHistory> = new Map();

  private constructor() {
    this.registerAiProvider()
  }

  /**
   * Listen to the provider settings
   */
  private async registerAiProvider() {
    await this.buildAgiServiceFromConfig()
    SettingChangedSubjection.subscribe(async ({scope, payload})=>{
      if(scope === MESSAGE_SCOPE_AGI_PROVIDER_CHANGED) {
        if(payload.prevConfigId !== payload.nextConfigId || payload.configChanged) {
          await this.buildAgiServiceFromConfig()
        }
      }
    })
  }

  public static getInstance() {
    return this._instance;
  }

  public on(callback: (lifecycleMessage: AiContextMessage) => void ) {
    return this._subject.subscribe(callback)
  }

  public getAgiService() : AgiService {
    return this._agiService!;
  }

  public subscribeMessageStream(callback: (messageChunk: MessageChunk) => void): Subscription {
    return this._messageStreamSubject.subscribe(callback);
  }

  /**
   * Simple chat in a session
   * @param sessionId
   * @param messageId
   * @param question
   */
  public async chat(
    sessionId: string,
    messageId: string,
    question: string
  ) {
    const history = await this.getMessageHistory(sessionId);
    await this.callAiService(
      messageId,
      [new HumanMessage(question)],
      {
        id: sessionId,
        history,
      }
    )
  }

  public async getMessageHistory(sessionId: string) : Promise<ConfigFileBoundChatMessageHistory> {
    let history = this.sessionMap.get(sessionId);
    if(!history) {
      history = new LocalForageChatMessageHistory(sessionId);
      await (history as LocalForageChatMessageHistory).init(AgiHelper.getCurrentUsingAgiConfig()!)
      this.sessionMap.set(sessionId, history)
    }
    if(!isEqual(history.getBoundConfig(), AgiHelper.getCurrentUsingAgiConfig()!)) {
      throw new Error('Session history config changed, Please create a new session!');
    }
    return history;
  }


  private async callAiService(
    chunkSubscriberId: string,
    messages: BaseMessage[],
    session?: AgiServiceSession,
  ){
    try {
      const stream = await this.getAgiService().generate(
        messages,
        session
      );
      let fullMessage = '';
      for await (const chunk of stream) {
        this._messageStreamSubject.next(new MessageChunk(chunkSubscriberId, chunk))
        fullMessage += chunk;
      }
      this._messageStreamSubject.next(new MessageChunk(chunkSubscriberId, '', true))
      return fullMessage;
    } catch (e) {
      console.error(e)
      this._messageStreamSubject.next(new MessageChunk(chunkSubscriberId, get(e,'message','Unknown Error Happened! Please check your settings or ask your service provider.'), true))
    }
  }


  public getAgiConfig() {
    return cloneDeep(this._currentAgiServiceConfig);
  }




  /**
   * Build the agi service from the config
   * @private
   */
  private async buildAgiServiceFromConfig(): Promise<void> {
    const currentUsingConfigId : string = await ConfigStorage.load(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID)

    if(!currentUsingConfigId) {
      this._agiService = new SupportedProviders[EMPTY_AGI_PROVIDER](null);
      return;
    }

    const configFile : AgiProviderConfigItem = await ConfigStorage.load(`${STORAGE_KEY.AGI_PROVIDER_CONFIG_PREFIX}${currentUsingConfigId}`)
    this._currentAgiServiceConfig = configFile;

    const ProviderConstructor = SupportedProviders[configFile.provider!];
    this._agiService = new ProviderConstructor(configFile.data);
    this._subject.next({action: 'providerReloaded'})
  }

}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window._aiAgent = Context.getInstance();
export default Context;