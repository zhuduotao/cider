import MuiForm from "@rjsf/mui";
import Form, {FormProps} from "@rjsf/core";
import {forwardRef} from "react";
import Validator from "./validator.ts";
const validator = new Validator()


/**
 * To avoid the CSP issue in chromium extension caused by ajv
 * We will use pre-compiled schema validator
 * @param props
 * @constructor
 */
const DynamicForm = forwardRef<Form,Omit<FormProps, 'validator'>>( (props, ref) => {

  const {
    schema,
    templates,
    uiSchema,
    ...restProps
  } = props


  return (
    <MuiForm
      ref={ref}
      validator={validator}
      schema={schema}
      uiSchema={{
        'ui:options': {
          submitButtonOptions: {
            norender: true,
          }
        }
      }}
      templates={{
        ErrorListTemplate: ()=> null,
        ...templates
      }}
      {...restProps}
    />
  )
} )

export default DynamicForm