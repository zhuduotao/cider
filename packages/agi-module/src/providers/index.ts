import {AgiServiceStatic} from "../agi-service.ts";
import AlibabaAgiServiceProvider from "./alibaba";
import OllamaAgiServiceProvider from "./ollama";
import EmptyAgiServiceProvider from "./EmptyAgiServiceProvider.ts";



export const SupportedProviders: Record<string, AgiServiceStatic> = {
  'empty': EmptyAgiServiceProvider,
  'alibaba': AlibabaAgiServiceProvider,
  'ollama': OllamaAgiServiceProvider,
}
