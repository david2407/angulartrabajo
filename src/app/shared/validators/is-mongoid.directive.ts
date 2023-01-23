import { AbstractControl, ValidatorFn } from '@angular/forms'
import { checkIfValidMongoID } from 'src/app/core/utils'

export function isMongoIdValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    // If empty or valid MongoDB ID, pass
    if (!control.value || checkIfValidMongoID(control.value)) {
      return null
    }

    return { invalidMongoId: { value: control.value } }
  }
}
