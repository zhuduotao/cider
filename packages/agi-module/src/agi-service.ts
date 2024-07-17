import {IterableReadableStream} from "@langchain/core/utils/stream";
import {BaseMessage} from "@langchain/core/messages";
import {BaseListChatMessageHistory} from "@langchain/core/chat_history";
import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {Runnable} from "@langchain/core/runnables";
import {BaseLanguageModelInput} from "@langchain/core/language_models/base";
import { RJSFSchema } from '@rjsf/utils';

export interface AgiServiceSession {
  id: string
  history: BaseListChatMessageHistory,
}

export interface AgiService {

  generate(
    messages: BaseMessage[],
    session?: AgiServiceSession
  ): Promise<IterableReadableStream<string>>

  preparedChain(
    chatModal: BaseChatModel,
    session?: AgiServiceSession | null
  ): Runnable<BaseLanguageModelInput>

}

export interface AgiServiceStatic {
  new(params: unknown): AgiService,
  configSchema: RJSFSchema
  disableConstruct?: boolean
}


