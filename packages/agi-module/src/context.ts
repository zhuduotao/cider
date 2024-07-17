import {BehaviorSubject, ReplaySubject, Subject, Subscription} from "rxjs";
import {AgiProviderConfigItem, MessageChunk} from "./types.ts";
import {AgiService, AgiServiceSession} from "./agi-service.ts";
import {BaseMessage, HumanMessage} from "@langchain/core/messages";
import {SupportedProviders} from "./providers";
import {LocalForageChatMessageHistory} from "./history/LocalForageChatMessageHistory.ts";
import {EMPTY_AGI_PROVIDER} from "./constants.ts";
import AgiHelper from "./index.ts";
import ConfigFileBoundChatMessageHistory from "./history/ConfigFileBoundChatMessageHistory.ts";
import {cloneDeep, get, isEqual} from "lodash-es";
import EmptyAgiServiceProvider from "./providers/EmptyAgiServiceProvider.ts";

export type AiContextMessage = {
  action:  'notReady'|'providerReloaded'
}

class Context {

  private static _instance = new Context();

  private _agiService: AgiService | null = null;

  private _currentAgiServiceConfig : AgiProviderConfigItem | null = null;


  private readonly _messageStreamSubject : Subject<MessageChunk>  = new ReplaySubject<MessageChunk>();
  private readonly _subject : Subject<AiContextMessage> = new BehaviorSubject<AiContextMessage>({action: 'notReady'})

  private sessionMap : Map<string, ConfigFileBoundChatMessageHistory> = new Map();

  private constructor() {
    this.buildAgiServiceFromConfig()
  }

  public static getInstance() {
    return this._instance;
  }

  public on(callback: (lifecycleMessage: AiContextMessage) => void ) {
    return this._subject.subscribe(callback)
  }

  public getAgiService() : AgiService {
    if(!this._agiService) return new EmptyAgiServiceProvider()
    return this._agiService!;
  }

  public subscribeMessageStream(messageId: string, callback: (messageChunk: MessageChunk) => void): Subscription {
    return this._messageStreamSubject.subscribe((chunk)=>{
      if(messageId === chunk.messageId) {
        callback?.(chunk)
      }
    });
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
      this._messageStreamSubject.next(new MessageChunk(chunkSubscriberId, get(e,'message','Unknown Error Happened! Please check your settings or ask your service provider.'), true))
    }
  }


  public getAgiConfig() {
    return cloneDeep(this._currentAgiServiceConfig);
  }

  public setApiConfig(config?: AgiProviderConfigItem) {
    if(!config) {
      config = {
        provider: EMPTY_AGI_PROVIDER,
        data: {},
        name: 'Agi provider not set',
        version: 0,
      }
    }
    this._currentAgiServiceConfig = config;
    const ProviderConstructor = SupportedProviders[config.provider!];
    this._agiService = new ProviderConstructor(config.data);
    this._subject.next({action: 'providerReloaded'})
  }


  /**
   * Build the agi service from the config
   * @private
   */
  private async buildAgiServiceFromConfig(): Promise<void> {



  }

}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window._agiService = Context.getInstance();
export default Context;