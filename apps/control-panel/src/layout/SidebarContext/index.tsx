import {ReactElement, useState} from "react";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab, Tooltip} from "@mui/material";

interface SidebarContextProps {
  modules: {
    id: string,
    label: string,
    icon: ReactElement
    element: ReactElement
  }[]
  defaultModuleId?: string
}



const SidebarContext = ({modules, defaultModuleId}: SidebarContextProps)=>{

  const [selected,setSelected] = useState<string>(
    defaultModuleId || modules[0]?.id
  )

  return (
    <TabContext value={selected}>
      <Box className="w-full h-full flex flex-row flex-nowrap overflow-hidden justify-start">
        <main className="w-full h-full flex-1 relative overflow-hidden">
          {modules.map(module=>(
            <TabPanel
              key={module.id}
              value={module.id}
              className="w-full h-full"
              sx={{
                padding: '8px',
                position: 'relative'
              }}
            >
              {module.element}
            </TabPanel>
          ))}
        </main>
        <aside className="w-12 h-full flex-grow-0 flex-shrink-0 shadow">
          <TabList
            orientation="vertical"
            onChange={(_,value)=>setSelected(value)}
            sx={{
              '.MuiTabs-indicator': {
                right: 'auto',
                left: 0
              }
            }}
          >
            {
              modules.map((module) => (
                <Tab
                  icon={(
                    <Tooltip placement="left" title={module.label}>
                      {module.icon}
                    </Tooltip>
                  )}
                  key={module.id}
                  aria-label={module.label}
                  value={module.id}
                  sx={{
                    minWidth: 0,
                    '&.MuiTab-root': {
                      marginRight: 0
                    },
                  }}
                />
              ))
            }
          </TabList>
        </aside>
      </Box>
    </TabContext>

  )
}
export default SidebarContext