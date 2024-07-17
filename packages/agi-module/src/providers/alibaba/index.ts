import {BaseMessage} from "@langchain/core/messages";
import AbstractAgiServiceProvider from "../AbstractAgiServiceProvider.ts";
import {AgiServiceSession} from "../../agi-service.ts";
import {ChatAlibabaTongyi} from "../../chat_models/alibaba_tongyi.ts";
import schema from "./schema.json";
import {RJSFSchema} from "@rjsf/utils";

class AlibabaAgiServiceProvider extends AbstractAgiServiceProvider {

  static configSchema : RJSFSchema = schema as RJSFSchema;

  chatModel: ChatAlibabaTongyi;

  constructor(params: unknown) {
    super();

    const config : {
      model?: string,
      apiUrl?: string,
      alibabaApiKey?: string
    } = params || {}

    this.chatModel = new ChatAlibabaTongyi({
      model: config.model || 'qwen-long',
      alibabaApiKey: config.alibabaApiKey,
      streaming: true,
    })
    if(config.apiUrl) {
      this.chatModel.apiUrl = config.apiUrl;
    } else if(import.meta.env.DEV) {
      this.chatModel.apiUrl = '/api/v1/services/aigc/text-generation/generation'
    }
  }

  public generate(
    messages: BaseMessage[],
    session?: AgiServiceSession
  ) {
    const chain = this.preparedChain(this.chatModel,session);
    return  chain.stream(messages,{configurable:{sessionId: session?.id}});
  }

}


export default AlibabaAgiServiceProvider;