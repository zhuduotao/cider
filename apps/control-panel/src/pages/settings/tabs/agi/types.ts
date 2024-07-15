import SupportedProviders from "@/modules/agi/providers";

export interface AgiProviderConfigItem {
  id?: string,
  provider?: keyof typeof SupportedProviders,
  name: string,
  version: number,
  data: any
}