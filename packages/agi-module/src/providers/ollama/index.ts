import {ChatOllama} from '../../chat_models/ollama'
import {BaseMessage} from "@langchain/core/messages";
import {IterableReadableStream} from "@langchain/core/utils/stream";
import AbstractAgiServiceProvider from "../AbstractAgiServiceProvider.ts";
import {AgiServiceSession} from "../../agi-service.ts";
import schema from "./schema.json";
import {RJSFSchema} from "@rjsf/utils";



class OllamaAgiServiceProvider extends AbstractAgiServiceProvider {

  static configSchema: RJSFSchema = schema as RJSFSchema

  chatModel: ChatOllama;

  constructor(params: unknown) {
    super()

    const config : {
      model?: string,
      baseUrl?: string
    } = params || {}

    this.chatModel = new ChatOllama({
      model: config.model || 'qwen2:1.5b',
      baseUrl: config.baseUrl
    })
  }

  generate(
    messages: BaseMessage[],
    session?: AgiServiceSession
  ): Promise<IterableReadableStream<string>> {
    const chain = this.preparedChain(this.chatModel,session);
    return chain.stream(messages,{configurable:{sessionId: session?.id}});
  }

}

export default OllamaAgiServiceProvider;