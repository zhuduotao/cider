import {Subject} from "rxjs";
import {MESSAGE_SCOPE_AGI_PROVIDER_CHANGED} from "@/constants.ts";

type SettingChangedMessage = {
  scope: typeof MESSAGE_SCOPE_AGI_PROVIDER_CHANGED,
  payload: {
    prevConfigId: string | null,
    nextConfigId: string | null,
    // mark that the agi-provider params has been changed
    configChanged: boolean
  }
}


export const SettingChangedSubjection: Subject<SettingChangedMessage> = new Subject()