import MainContainer from "@/components/main-container";
import {ReactNode, useState} from "react";
import {Tab} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import AgiSettingsTab from "./tabs/agi";

const moduleSettings : {
  id: string,
  label: string,
  component: ReactNode
}[] = [
  {
    id: 'agi',
    label: 'AI Service',
    component: <AgiSettingsTab />
  }
]

const Settings = ()=> {

  const [selected, setSelected] = useState<string>(moduleSettings[0].id);

  return (
    <MainContainer>
      <TabContext value={selected}>
        <TabList
          className="shadow"
          onChange={(_,value)=>setSelected(value)}
          sx={{
            '.MuiTabs-indicator': {
              right: 'auto',
              left: 0
            }
          }}
        >
          {
            moduleSettings.map(module=>{
              return (
                <Tab
                  key={module.id}
                  label={module.label}
                  aria-label={module.label}
                  value={module.id}
                />
              )
            })
          }
        </TabList>
        <div>
          {moduleSettings.map(module=>(
            <TabPanel
              key={module.id}
              value={module.id}
              className="w-full h-full"
              sx={{
                padding: '8px 0',
                position: 'relative'
              }}
            >
              {module.component}
            </TabPanel>
          ))}
        </div>
      </TabContext>
    </MainContainer>
  )
}
export default Settings;