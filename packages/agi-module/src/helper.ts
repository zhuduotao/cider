import Context, {AiContextMessage} from "./context.ts";
import {Subscription} from "rxjs";
import {AgiProviderConfigItem, MessageChunk} from "./types.ts";

/**
 * High-level api of AI context
 */
class AgiHelper {
  private constructor() {}

  static setApiConfig(config?: AgiProviderConfigItem) {
    return Context.getInstance().setApiConfig(config)
  }

  /**
   * Add listener to the AI context lifecycle
   * @param lifecycleCallback
   */
  static on(lifecycleCallback: (lifecycleMessage: AiContextMessage) => void): Subscription {
    return Context.getInstance().on(lifecycleCallback)
  }

  /**
   * Basic chat
   */
  static async chat(
    sessionId: string,
    messageId: string,
    question: string,
    messageChunkCallback?:  (messageChunk: MessageChunk) => void
  ) {
    await Context.getInstance().chat(sessionId, messageId, question)
    if(messageChunkCallback) {
      const subscription = Context.getInstance().subscribeMessageStream(messageId,(messageChunk: MessageChunk)=>{
        if(messageChunk.messageId === messageId) {
          // pass the chunk to the original callback
          messageChunkCallback?.(messageChunk)
          // if message is end, unsubscribe the subscription
          if(messageChunk.end) {
            subscription.unsubscribe()
          }
        }
      })
    }
  }

  /**
   * If not using the chat callback, you can use this method to subscribe the message stream
   */
  static subscribeMessageStream(messageId: string,callback: (messageChunk: MessageChunk) => void): Subscription {
    return Context.getInstance().subscribeMessageStream(messageId, callback)
  }

  /**
   * Get historic messages from the AI context
   * The component may not exist until the AI finished answer your question
   * So you can recover your full message from the memory
   * @param sessionId
   */
  static async getMessages(sessionId: string) {
    return await Context.getInstance().getMessageHistory(sessionId)
  }

  /**
   * Get current using AI config
   */
  static getCurrentUsingAgiConfig() {
    return Context.getInstance().getAgiConfig()
  }

}

export default AgiHelper