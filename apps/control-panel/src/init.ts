import ConfigStorage from "@/modules/storage/config-storage.ts";
import {STORAGE_KEY} from "@/constants/config_keys.ts";
import AgiHelper from "@cider/agi-module";
import {AgiProviderConfigItem} from "@/pages/settings/tabs/agi/types.ts";
import {SettingChangedSubjection} from "@/subjects.ts";
import {MESSAGE_SCOPE_AGI_PROVIDER_CHANGED} from "@/constants.ts";

async function initAgiProvider() {
  await loadAgiConfig()
  SettingChangedSubjection.subscribe(async ({scope, payload})=>{
    if(scope === MESSAGE_SCOPE_AGI_PROVIDER_CHANGED) {
      if(payload.prevConfigId !== payload.nextConfigId || payload.configChanged) {
        await loadAgiConfig()
      }
    }
  })
}



async function loadAgiConfig(){
  const currentUsingConfigId : string = await ConfigStorage.load(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID)
  if(!currentUsingConfigId) return
  const configFile : AgiProviderConfigItem = await ConfigStorage.load(`${STORAGE_KEY.AGI_PROVIDER_CONFIG_PREFIX}${currentUsingConfigId}`)
  if(configFile) AgiHelper.setApiConfig(configFile)
}

async function globalInit() {
  await initAgiProvider()
}

export default globalInit