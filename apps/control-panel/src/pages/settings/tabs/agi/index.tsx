import MainContainer from "@/components/main-container";
import {Button, List, ListItem, ListItemText, Switch} from "@mui/material";
import {AddOutlined} from "@mui/icons-material";
import {useEffect, useState} from "react";
import {AgiProviderConfigItem} from "./types.ts";
import AgiServiceEditor from "./editor.tsx";
import ConfigStorage from "@/modules/storage/config-storage.ts";
import {STORAGE_KEY} from "@/constants/config_keys.ts";
import {SettingChangedSubjection} from "@/subjects.ts";
import {MESSAGE_SCOPE_AGI_PROVIDER_CHANGED} from "@/constants.ts";
import {randomUUID} from "@/utils/random.ts";
import {isEqual} from "lodash-es";
import dayjs from "dayjs";

const AgiSettingsTab = () => {

  const [editingItem,setEditingItem] = useState<AgiProviderConfigItem | null>(null)
  const [configFiles,setConfigFiles] = useState<AgiProviderConfigItem[]>([])
  const [usingConfigId,setUsingConfigId] = useState<string>()

  const onCreate = () => {
    setEditingItem({
      name: 'Unnamed Agi Service',
      data: {},
      version: 0
    })
  }

  const reloadConfig = async () => {
    setUsingConfigId(await ConfigStorage.load(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID))
    const configIds : string[] = await ConfigStorage.load(STORAGE_KEY.AGI_PROVIDER_CONFIG_IDS) || []
    const list: AgiProviderConfigItem[] = [];
    for(const configId of configIds) {
      list.push(await ConfigStorage.load(`${STORAGE_KEY.AGI_PROVIDER_CONFIG_PREFIX}${configId}`))
    }
    setConfigFiles(list)
  }

  const handleOnActiveConfig = async (checked:boolean, configId: string) =>{
    if(!checked) return
    await ConfigStorage.save(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID,configId)
    SettingChangedSubjection.next({
      scope: MESSAGE_SCOPE_AGI_PROVIDER_CHANGED,
      payload: {
        prevConfigId: usingConfigId || null,
        nextConfigId: configId,
        configChanged: false
      }
    })
    setUsingConfigId(configId)
  }

  useEffect(()=>{reloadConfig()},[])


  return (
    <MainContainer>
      <div className="flex flex-row items-center justify-end gap-1 pt-1 pb-1">
        <Button
          variant="outlined"
          startIcon={<AddOutlined />}
          onClick={onCreate}
        >
          Create New
        </Button>
      </div>
      <List>
        {
          configFiles.map(file=>(
            <ListItem
              key={file.id!}
            >
              <ListItemText
                onClick={()=>setEditingItem(file)}
                primary={file.name}
                secondary={`Provider: ${file.provider}`}
              />
              <Switch
                edge="end"
                checked={usingConfigId === file.id}
                onChange={(_, checked) => handleOnActiveConfig(checked,file.id!)}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-wifi',
                }}
              />
            </ListItem>
          ))
        }
      </List>
      <AgiServiceEditor
        editingConfig={editingItem}
        onSave={async (configFile)=>{

          // close the editor
          setEditingItem(null)

          // generate the config id for new-created file
          const configId = editingItem?.id || randomUUID();
          configFile.id = configId;

          const configFileKey = `${STORAGE_KEY.AGI_PROVIDER_CONFIG_PREFIX}${configId}`;

          let settingChanged = false;

          const previousConfigFile = await ConfigStorage.load<AgiProviderConfigItem>(configFileKey)
          // Check if the config has changed
          if(!isEqual(previousConfigFile?.data,configFile.data) || previousConfigFile?.provider !== configFile.provider) {
            settingChanged = true;
          }
          if(settingChanged) {
            // update the version
            // all message histories of this config file will be expired
            configFile.version = dayjs().valueOf()
          } else {
            configFile.version = previousConfigFile?.version || 0
          }

          // save the config
          await ConfigStorage.save(configFileKey, configFile)
          const configFileIds = await ConfigStorage.load<string[]>(STORAGE_KEY.AGI_PROVIDER_CONFIG_IDS) || []
          if(!configFileIds.includes(configId)) {
            await ConfigStorage.save(STORAGE_KEY.AGI_PROVIDER_CONFIG_IDS,[...configFileIds,configId])
          }

          const previousConfigId : string = await ConfigStorage.load(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID)
          await ConfigStorage.save(STORAGE_KEY.CURRENT_AGI_PROVIDER_CONFIG_ID,configId)
          SettingChangedSubjection.next({
            scope: MESSAGE_SCOPE_AGI_PROVIDER_CHANGED,
            payload: {
              prevConfigId: previousConfigId,
              nextConfigId: configId,
              configChanged: (previousConfigId === configId && settingChanged)
            }
          })
          await reloadConfig()
        }}
        onClose={()=>{setEditingItem(null)}}
      />
    </MainContainer>
  )
}

export default AgiSettingsTab;