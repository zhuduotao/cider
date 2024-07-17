import {BaseListChatMessageHistory} from "@langchain/core/chat_history";
import {AgiProviderConfigItem} from "../types.ts";

export default abstract class ConfigFileBoundChatMessageHistory extends BaseListChatMessageHistory {

  abstract getBoundConfig(): AgiProviderConfigItem;

}