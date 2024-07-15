import {AgiService, AgiServiceSession} from "../agi-service.ts";
import {BaseMessage} from "@langchain/core/messages";
import {IterableReadableStream} from "@langchain/core/utils/stream";
import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {StringOutputParser} from "@langchain/core/output_parsers";
import {RunnableWithMessageHistory} from "@langchain/core/runnables";

abstract class AbstractAgiServiceProvider implements AgiService {

  abstract  generate(
    messages: BaseMessage[],
    session?: AgiServiceSession
  ): Promise<IterableReadableStream<string>>

  preparedChain(
    chatModal: BaseChatModel,
    session?: AgiServiceSession | null
  ) {
    let chain = chatModal.pipe(new StringOutputParser());
    if(session) {
      chain = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: () => {
          return session.history
        },
      })
    }
    return chain
  }
}

export default AbstractAgiServiceProvider;