import {
  Box, Button,
  Card,
  CardContent,
  CardHeader,
  Drawer,
} from "@mui/material";
import {AgiProviderConfigItem} from "./types.ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {RJSFSchema} from '@rjsf/utils';
import SupportedProviders from "@/modules/agi/providers";
import emptySvg from '@/assets/empty.svg'
import Form from '@rjsf/core'
import DynamicForm from "@/components/forms/dynamic-form.tsx";


interface AgiServiceEditorProps {
  editingConfig?: AgiProviderConfigItem | null,
  onSave: (configFile: AgiProviderConfigItem)=>void
  onClose: ()=>void
}

const basicInfoSchema : RJSFSchema = {
  type: 'object',
  properties: {
    provider: {
      type: 'string',
      enum: Object.keys(SupportedProviders).filter(key => !SupportedProviders[key].disableConstruct)
    },
    name: {
      type: 'string'
    }
  },
  required: ['provider','name']
}

const AgiServiceEditor = (
  props: AgiServiceEditorProps
)=> {

  const {
    editingConfig
  } = props

  const [configSchema,setConfigSchema] = useState<RJSFSchema>()

  const basicFormRef = useRef<Form>(null)
  const configFormRef = useRef<Form>(null)

  useEffect(()=>{

  },[editingConfig])

  const onClickSave = async ()=> {
    if(
      !basicFormRef.current?.validateForm()
      && !configFormRef.current?.validateForm()
    ) {
      return
    }


    const basicFormData = basicFormRef.current?.state.formData
    const configFormData = configFormRef.current?.state.formData

    const configId = props.editingConfig?.id;
    const configFileData: AgiProviderConfigItem = {
      id: configId,
      ...basicFormData,
      data: {
        ...configFormData
      }
    }
    console.log('result',configFileData)

    props.onSave?.(configFileData);
  }

  const onClickClose = ()=> {
    props.onClose?.();
  }

  const memorizedBasicForm = useMemo(()=>(
    <DynamicForm
      ref={basicFormRef}
      schema={basicInfoSchema}
      onChange={({formData})=>{
        setConfigSchema(SupportedProviders[formData.provider]?.configSchema)
      }}
    />
  ),[editingConfig])

  const memorizedConfigForm = useMemo(()=>(
    <>
      {
        configSchema ? (
          <Card>
            <CardContent>
              <DynamicForm
                ref={configFormRef}
                schema={configSchema}
              />
            </CardContent>
          </Card>
        ):(
          <Card className="flex flex-col items-center justify-center py-12 gap-4">
            <img src={emptySvg} alt="empty" className="w-24 h-24"/>
            <span className="text-gray-500 text-center text-sm mt-2">Please select your provider</span>
          </Card>
        )
      }
    </>
  ),[editingConfig, configSchema])


  return (
    <Drawer
      anchor="right"
      open={!!props.editingConfig}
    >
      <Box
        className="w-80 h-full p-4 flex flex-col gap-4 flex-nowrap"
      >
        <div className="flex-shrink-0 flex-grow-0">
          <Card>
            <CardHeader title="Config file basic info" />
            <CardContent>
              { memorizedBasicForm }
            </CardContent>
          </Card>
        </div>
        <div className="flex-1 h-full">
          { memorizedConfigForm }
        </div>
        <div className="flex-grow-0 flex-shrink-0 flex flex-row items-center justify-end">
          <Button onClick={onClickClose} color="warning">Cancel</Button>
          <Button onClick={onClickSave}>Save</Button>
        </div>
      </Box>
    </Drawer>
  )
}
export default AgiServiceEditor