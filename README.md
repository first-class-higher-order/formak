# Formak #

![npm](https://img.shields.io/npm/v/@first-class/formak?color=green&style=flat-square)

### This is a simple small form wrapper to simplify your working process with forms in React ###


## General information ##

#### The goal of the library to provide convenient way of handling a form without adding everytime new (but the same at the time) onChange, onSubmit events. Additionaly it provides a simple way of validation. Check it out. ####

## Features ##
 * to use touched fields just check the prop `touchedFields` and the value in it:

```js
props.touchedFields.includes( 'fieldName' )
```
  the wrapper detects a touched field only after the first change was done. This doesn't affect a field on the first rendering.
  * to validate the fields provide a specific validator. The ordering does matter! It handles and displays only first validation error and further until it's ok.

## Installation ##

```sh
npm install @first-class/formak --save
```

## Usage ##

Here is a simple example:

```js
import React from 'react'
import { wrapForm } from '@first-class/formak'

// validators
const validateLength = ( maxCount = 30 ) => value => {
  if ( value.length < maxCount ) {
    return value
  }
  throw new Error( `Field must be greater than 0 and less than ${maxCount} chars.` )
}

// a simple component wrapped with wrapForm function
const PlainExample = ( props ) => {
  <div>
    <span>{ props.errors.non_field_errors ? props.errors.non_field_errors : null }</span>
    <input
      onChange={ e => props.onChange( 'firstName', e.currentTarget.value ) }
      type="text"
    />
    <span>{ props.touchedFields.includes( 'firstName' ) && props.errors.firstName ? props.errors.firstName : null }</span>
    <input
      onChange={ e => props.onChange( 'lastName', e.currentTarget.value ) }
      type="text"
    />
    <span>{ props.touchedFields.includes( 'lastName' ) && props.errors.firstName ? props.errors.firstName : null }</span>
    <input
      onClick={ props.onSubmit }
      type="button"
    />
  </div>
}
const Example = wrapForm( PlainExample )

// functionality with top-level validation and submit etc
const ExampleContainer = ( props ) => {
  const [ errors, setErrors ] = React.useState( {} )
  ...
  const onSubmit = data => {
    send( 'some_url', { method: 'POST' }, JSON.stringify( data ) ).then(
      response => alert( 'Everything was saved!' )
    ).catch(
      err => setErrors( { ...errors, ...{ non_field_errors: err.message } )
    )
  }
  ...
  return (
    <Example
      errors={ errors } // general errors (from the server for instance)
      schema={ {
        firstName: [validateLength(15)],
        lastName: [validateLength()],
      } }
      formValues={ {
        firstName: '',
        lastName: '',
      } }
      canBeEmpty={ true }
      isSentOnlyTouched={ false }
      submitForm={ onSubmit }
    />
  )
}
```

## API ##

| Property | Description | Default value |
| --- | --- | --- |
| schema            | an object with keys (field names) + array of validators to the each field. | required |
| formValues        | an object with keys (field names) and default values (even empty) | required |
| canBeEmpty        | form can be empty for submitting ( can send default formValues ) | false |
| isSentOnlyTouched | send only touched filds | false |
| submitForm        | function to pass submit handling | required |

## LICENCE ##

Formak is released under the [MIT License](https://opensource.org/licenses/MIT).

## 2020 ##
