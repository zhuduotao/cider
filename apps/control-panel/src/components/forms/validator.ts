import {CustomValidator, ErrorSchema, ErrorTransformer,
  RJSFSchema,
  RJSFValidationError,
  UiSchema,
  ValidationData,
  ValidatorType
} from "@rjsf/utils";
import {Schema, ValidationError, Validator} from "jsonschema"

/**
 * A very simple validator, implement with jsonschema lib
 * to avoid the compilation of ajv
 * which may cause CSP errors in chrome extensions
 * only support simple object (no nested structure) validation
 * if needed, I will extend this class to support complex json-form features
 * @author Tristan.Zhu
 */
export default class JsonSchemaValidator implements ValidatorType<any, RJSFSchema, any> {

  private validator : Validator

  constructor() {
    this.validator = new Validator()
  }

  validateFormData(formData: any, schema: RJSFSchema, _customValidate?: CustomValidator<any, RJSFSchema, any> | undefined, _transformErrors?: ErrorTransformer<any, RJSFSchema, any> | undefined, _uiSchema?: UiSchema<any, RJSFSchema, any> | undefined): ValidationData<any> {
    const rs = this.rawValidation(schema, formData)
    const errors : RJSFValidationError[] = (rs.errors as ValidationError[]).map((err):RJSFValidationError =>{
      const convertedError : RJSFValidationError =  {
        name: err.name,
        property: err.argument,
        message: err.message,
        stack: err.stack,
        schemaPath: `#/${err.name}`
      }
      if(convertedError.name === 'required') {
        convertedError.params = {
          missingProperty: err.argument
        }
      }
      return convertedError;
    })

    const errorSchema : ErrorSchema = {}
    for(const err of errors) {
      errorSchema[err.property!] = {
        __errors: [err.stack]
      } as ErrorSchema
    }

    return {
      errors,
      errorSchema
    }
  }
  toErrorList(_errorSchema?: ErrorSchema<any> | undefined, _fieldPath?: string[] | undefined): RJSFValidationError[] {
    return []
  }

  isValid(schema: RJSFSchema, formData: any, _rootSchema: RJSFSchema): boolean {
    const rs = this.validator.validate(formData, schema as Schema)
    return rs.valid
  }

  rawValidation<Result = any>(schema: RJSFSchema, formData?: any): { errors?: Result[] | undefined; validationError?: Error | undefined; } {
    const rs = this.validator.validate(formData, schema as Schema);
    return {
      errors: rs.errors as unknown as Result[],
    }
  }
}