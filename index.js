import React, { Component } from 'react'
import PropTypes from 'prop-types'


// remap module

/*
Unified composition function
Example:
  const g = n => n + 1
  const f = n => n * 2
  result = compose( f, g )
  result( 20 ) //=> 42
*/
const compose = ( ...fns ) => x => fns.reduceRight( ( y, f ) => f( y ), x )

// Remap object of objects to array of objects
// Set first error from errors array
export const objToArray = obj => Object.keys( obj ).map( key => (
  { [key]: obj[key][0] }
) )

// Remap array values to object ones (nested values got by key also array-like)
// Usage example: errors array (typically from a server) to object-like one
export const remapArrayToObj = data => data.reduce( ( res, value ) => {
  const key = Object.keys( value )[0]
  // unable to omit getting a value by dynamic key the other way
  res[key] = value[key] // eslint-disable-line prefer-destructuring
  return res
}, {} )

// Remap server errors for the correct visibility in forms
export const remapServerErrors = compose( remapArrayToObj, objToArray )


export const wrapForm = function( WrappedComponent ) {
  // a wrapper to provide a generic way of handling the data to any form
  // this interface provides data changing, submitting and validating functionality
  // USAGE:

  // pass the necessary properties to the wrapper component:
  //   - submitForm - function to pass submit handling;
  //   - formValues - an object with keys (field names) and default values (even empty)
  //   - schema - an object with keys (field names) + array of validators to the each field.
  //   - canBeEmpty - from can be empty for submitting ( can send default formValues )

  // /functionality
  // - TOUCHED | to make touched fields just check the prop `touchedFields` and the value in it:
  //    props.touchedFields.includes( 'fieldName' )
  // wrapper detects a touched field only after the first change was done. This doesn't
  // affect a field on the first rendering.
  // - VALIDATORS | to validate the fields provide a specific validator. The ordering does matter!
  // It handles and displays only first validation error and further until it's ok.
  const FormWrapper = class FormWrapper extends Component {

    constructor( props ) {
      super( props )
      this.state = {
        formValues: this.props.formValues,
        errors: {},
        touched: [],
      }
      this.onChange = this.onChange.bind( this )
      this.onSubmit = this.onSubmit.bind( this )
      this.validateValue = this.validateValue.bind( this )
      this.hasEmptyFields = this.hasEmptyFields.bind( this )
      this.isValid = this.isValid.bind( this )
      this.validateBySchema = this.validateBySchema.bind( this )
    }

    validateValue( key ) {
      // get a specific value from form values by the provided scheme key
      const value = this.state.formValues[ key ]
      // get the scheme validators by the provided key
      const validators = this.props.schema[ key ]
      let exception = null
      const error = this.state.errors[ key ]
      for ( const validator of validators ) {
        try {
          validator( value )
        } catch ( e ) {
          // set found exception to state
          exception = e.message
          break
        }
      }
      if ( !exception && error ) {
        // reset errors if there was an error and now it's ok
        // do not run this block if there was caught exception
        return null
      }

      // if there is an error then return it otherwise null above and below
      if ( exception ) {
        return { [key]: exception }
      }
      return null
    }

    validateBySchema() {
      const validatedRes = Object.keys( this.props.schema ).map( schemaElKey => {
        return this.validateValue( schemaElKey )
      } ).filter( el => el )
      const errors = remapArrayToObj( validatedRes )
      this.setState( { errors } )
    }

    onChange( key, value ) {
      // pass a field key, value and validators if you need it to get errors
      // validator is a plain function returns a value if everything is ok
      // and raises an exception if something is wrong (with the custom provided message)
      let touched = [...this.state.touched]
      if ( !touched.includes( key ) ) {
        touched = touched.concat( key ) // add first time touched field
      }
      // copy and set a new form field value
      const formValues = { ...this.state.formValues }
      formValues[ key ] = value
      this.setState( { formValues, touched }, () => {
        // validate data hold in state to get the correct values and render the correct errors
        this.validateBySchema()
      } )
    }

    hasEmptyFields() {
      // we can submit default(empty) formValues
      if ( this.props.canBeEmpty === true ) return false
      const result = Object.keys( this.state.formValues ).filter( field => {
        // find an empty value at least to verify form is not empty
        // also we return false if field doesn't have validations
        // TODO: make possible to have empty field in the form
        if ( this.state.formValues[ field ] || this.props.schema[ field ].length === 0 ) {
          // if a field is not empty
          return false
        }
        return true
      } )
      return result.length > 0
    }

    isValid() {
      // a method checks wherther a form has empty fields or any errors
      if ( this.hasEmptyFields() || Object.keys( this.state.errors ).length > 0 || Object.keys( this.props.errors ).length > 0 ) {
        return false
      }
      return true
    }

    onSubmit() {
      // added from add form and edit form
      // We should have an id in this.props.formValues to edit form
      // else we will add a new object
      this.validateBySchema()
      if ( !this.isValid() ) return null
      // send only touched fields if this is a setting, either way all form values
      // a good choice when you send a form data instance with empty values, for inst
      const formVals = this.props.isSentOnlyTouched ?
        this.state.touched.reduce(
          ( acc, key ) => {
            acc[ key ] = this.state.formValues[ key ]; return acc
          },
          {},
        )
        :
        this.state.formValues
      this.props.submitForm( formVals )
      this.setState( { touched: Object.keys( this.props.formValues ) } )
    }

    render() {
      return (
        <WrappedComponent
          { ...this.props }
          formValues={ this.state.formValues }
          touchedFields={ this.state.touched }
          errors={ { ...this.state.errors, ...this.props.errors } } // merge errors
          onChange={ this.onChange }
          onSubmit={ this.onSubmit }
          isValid={ this.isValid }
        />
      )
    }
  }

  FormWrapper.defaultProps = {
    canBeEmpty: false,
    isSentOnlyTouched: false,
  }

  FormWrapper.propTypes = {
    submitForm: PropTypes.func,
    errors: PropTypes.object,
    id: PropTypes.number,
    formValues: PropTypes.object,
    schema: PropTypes.object,
  }

  return FormWrapper
}
