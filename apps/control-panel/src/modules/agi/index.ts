import Context, {AiContextMessage} from "@/modules/agi/context.ts";
import {Subscription} from "rxjs";
import {MessageChunk} from "@/modules/agi/types.ts";

/**
 * High-level api of AI context
 */
class AgiHelper {
  private constructor() {}

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
      const subscription = Context.getInstance().subscribeMessageStream((messageChunk: MessageChunk)=>{
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
  static subscribeMessageStream(callback: (messageChunk: MessageChunk) => void): Subscription {
    return Context.getInstance().subscribeMessageStream(callback)
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