import {
  ErrorSchema,
  RJSFSchema,
  RJSFValidationError,
  ValidationData,
  ValidatorType,
} from '@rjsf/utils'
import { Schema, ValidationError, Validator } from 'jsonschema'

/**
 * The official validator of react-jsonschema-form is @rjsf/validator-ajv8, powered by ajv
 * But the ajv lib uses `Function('<string format code>')` to compile the json into validator
 * This behavior conflicts with current CSP policy no `unsafe-eval`
 * Replace the validator core with jsonschema
 * A simple replacement
 * those features will not be supported in this version
 * - $ref
 * @author Tristan.Zhu
 */
export default class JsonSchemaValidator
  implements ValidatorType<any, RJSFSchema, any>
{
  private validator: Validator

  constructor() {
    this.validator = new Validator()
  }

  validateFormData(formData: any, schema: RJSFSchema): ValidationData<any> {
    const rs = this.rawValidation(schema, formData)
    const errors = rs.errors?.map(convertJsonSchemaErrorAsRjsf) || []
    const errorSchema: ErrorSchema = {}

    for (const err of errors) {
      errorSchema[err.property!] = {
        __errors: [friendlyErrorMessage(err._rawError)],
      } as ErrorSchema
    }

    return {
      errors,
      errorSchema,
    }
  }

  toErrorList(): RJSFValidationError[] {
    return []
  }

  isValid(schema: RJSFSchema, formData: any): boolean {
    const rs = this.validator.validate(formData, schema as Schema)
    return rs.valid
  }

  rawValidation<Result = any>(
    schema: RJSFSchema,
    formData?: any
  ): { errors?: Result[] | undefined; validationError?: Error | undefined } {
    const rs = this.validator.validate(formData, schema as Schema)
    return {
      errors: rs.errors as unknown as Result[],
    }
  }
}

function friendlyErrorMessage(error: ValidationError): string {
  return error.message
}

function convertJsonSchemaErrorAsRjsf(error: ValidationError) {
  const rs: RJSFValidationError & {
    _rawError: ValidationError
  } = {
    stack: '',
    _rawError: error,
  }

  const { path = [], argument = '', stack, name, message } = error

  rs.stack = stack
  rs.message = message
  rs.name = name

  if (path.length) {
    rs.property = `${path
      .map((p) => (typeof p === 'string' ? p : `[${p}]`))
      .join('.')}`
  } else {
    rs.property = argument
  }

  return rs
}
