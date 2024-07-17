import {SupportedProviders} from "@cider/agi-module";

export interface AgiProviderConfigItem {
  id?: string,
  provider?: keyof typeof SupportedProviders,
  name: string,
  version: number,
  data: any
}