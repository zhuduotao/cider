import {BaseMessage} from "@langchain/core/messages";
import {IterableReadableStream} from "@langchain/core/utils/stream";
import AbstractAgiServiceProvider from "./AbstractAgiServiceProvider.ts";
import {AgiServiceSession} from "../agi-service.ts";

const EMPTY_ERROR_TIP : string = 'You have not configured the AGI service yet. Please go to the settings page to configure one.'

class EmptyAgiServiceProvider extends AbstractAgiServiceProvider {

  static configSchema = {}

  static disableConstruct = true

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_params: unknown) {
    super()
  }

  generate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _messages: BaseMessage[], _session?: AgiServiceSession
  ): Promise<IterableReadableStream<string>> {
    throw new Error(EMPTY_ERROR_TIP);
  }
}


export default EmptyAgiServiceProvider;