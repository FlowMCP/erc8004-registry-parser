const SPEC_TYPE_VALUE = 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1'

const KNOWN_PROTOCOLS = [ 'mcp', 'a2a', 'oasf', 'ens', 'did' ]

const KNOWN_TRUST_TYPES = [ 'reputation', 'crypto-economic', 'tee-attestation' ]

const KNOWN_SPEC_FIELDS = [
    'type', 'name', 'description', 'image', 'services',
    'x402Support', 'active', 'supportedTrust'
]


class RegistrationValidator {


    static validate( { json, uriType } ) {
        const messages = []

        if( json === null || json === undefined ) {
            return { status: false, messages: [ 'json: Is null or undefined' ] }
        }

        if( typeof json !== 'object' || Array.isArray( json ) ) {
            return { status: false, messages: [ 'json: Is not a valid object' ] }
        }

        RegistrationValidator.#validateRequiredFields( { parsed: json, messages } )
        RegistrationValidator.#validateServices( { parsed: json, messages } )
        RegistrationValidator.#validateX402( { parsed: json, messages } )
        RegistrationValidator.#validateOptionalFields( { parsed: json, messages } )
        RegistrationValidator.#validateExtraFields( { parsed: json, messages } )

        const status = messages.length === 0

        return { status, messages }
    }


    static #validateRequiredFields( { parsed, messages } ) {
        if( parsed['type'] === undefined ) {
            messages.push( `type: Missing required field (expected "${SPEC_TYPE_VALUE}")` )
        } else if( typeof parsed['type'] !== 'string' ) {
            messages.push( 'type: Is not type of "string"' )
        } else if( parsed['type'] !== SPEC_TYPE_VALUE ) {
            messages.push( `type: Invalid value "${parsed['type']}" (expected "${SPEC_TYPE_VALUE}")` )
        }

        if( parsed['name'] === undefined ) {
            messages.push( 'name: Missing required field' )
        } else if( typeof parsed['name'] !== 'string' ) {
            messages.push( 'name: Is not type of "string"' )
        } else if( parsed['name'] === '' ) {
            messages.push( 'name: Is empty string' )
        }

        if( parsed['description'] === undefined ) {
            messages.push( 'description: Missing field' )
        } else if( typeof parsed['description'] !== 'string' ) {
            messages.push( 'description: Is not type of "string"' )
        } else if( parsed['description'] === '' ) {
            messages.push( 'description: Is empty string' )
        }
    }


    static #validateServices( { parsed, messages } ) {
        if( parsed['services'] === undefined ) {
            return
        }

        if( !Array.isArray( parsed['services'] ) ) {
            messages.push( 'services: Is not type of "array"' )

            return
        }

        if( parsed['services'].length === 0 ) {
            messages.push( 'services: Is empty array' )

            return
        }

        parsed['services']
            .forEach( ( service, index ) => {
                const hasType = service['type'] !== undefined
                const hasName = service['name'] !== undefined

                if( !hasType && !hasName ) {
                    messages.push( `services[${index}]: Missing protocol identifier ("type" or "name")` )
                } else if( !hasType && hasName ) {
                    messages.push( `services[${index}].name: Uses "name" instead of spec-defined "type"` )
                }

                const hasUrl = service['url'] !== undefined
                const hasEndpoint = service['endpoint'] !== undefined

                if( !hasUrl && !hasEndpoint ) {
                    messages.push( `services[${index}]: Missing endpoint ("url" or "endpoint")` )
                } else if( !hasUrl && hasEndpoint ) {
                    messages.push( `services[${index}].endpoint: Uses "endpoint" instead of spec-defined "url"` )
                }

                const protocolValue = service['type'] || service['name'] || ''
                const normalizedProtocol = protocolValue.toLowerCase()
                if( protocolValue && !KNOWN_PROTOCOLS.includes( normalizedProtocol ) ) {
                    messages.push( `services[${index}]: Unknown protocol "${protocolValue}" (known: ${KNOWN_PROTOCOLS.join( ', ' )})` )
                }

                const urlValue = service['url'] || service['endpoint'] || null
                if( urlValue !== null ) {
                    const { isValid } = RegistrationValidator.#isValidUrl( { value: urlValue } )
                    if( !isValid ) {
                        messages.push( `services[${index}].url: Invalid URL format` )
                    }
                }
            } )
    }


    static #validateX402( { parsed, messages } ) {
        const hasCorrectCase = parsed['x402Support'] !== undefined
        const hasLowerCase = parsed['x402support'] !== undefined

        if( hasLowerCase && !hasCorrectCase ) {
            messages.push( 'x402support: Uses lowercase "x402support" instead of spec-defined "x402Support"' )
        }

        const x402Value = hasCorrectCase ? parsed['x402Support'] : ( hasLowerCase ? parsed['x402support'] : undefined )

        if( x402Value !== undefined && typeof x402Value !== 'boolean' ) {
            const fieldName = hasCorrectCase ? 'x402Support' : 'x402support'
            messages.push( `${fieldName}: Is not type of "boolean", got "${typeof x402Value}"` )
        }
    }


    static #validateOptionalFields( { parsed, messages } ) {
        if( parsed['image'] !== undefined ) {
            if( typeof parsed['image'] !== 'string' ) {
                messages.push( 'image: Is not type of "string"' )
            } else {
                const { isValid } = RegistrationValidator.#isValidUrl( { value: parsed['image'] } )
                if( !isValid ) {
                    messages.push( 'image: Is not a valid URL' )
                }
            }
        }

        if( parsed['active'] !== undefined && typeof parsed['active'] !== 'boolean' ) {
            messages.push( 'active: Is not type of "boolean"' )
        }

        if( parsed['supportedTrust'] !== undefined ) {
            if( !Array.isArray( parsed['supportedTrust'] ) ) {
                messages.push( 'supportedTrust: Is not type of "array"' )
            } else {
                parsed['supportedTrust']
                    .forEach( ( trustValue, index ) => {
                        if( !KNOWN_TRUST_TYPES.includes( trustValue ) ) {
                            messages.push( `supportedTrust[${index}]: Unknown value "${trustValue}" (known: ${KNOWN_TRUST_TYPES.join( ', ' )})` )
                        }
                    } )
            }
        }
    }


    static #validateExtraFields( { parsed, messages } ) {
        const allowedFields = [ ...KNOWN_SPEC_FIELDS, 'x402support' ]

        Object.keys( parsed )
            .forEach( ( key ) => {
                if( !allowedFields.includes( key ) ) {
                    messages.push( `${key}: Unknown field not defined in ERC-8004 spec` )
                }
            } )
    }


    static #isValidUrl( { value } ) {
        try {
            new URL( value )
            const isValid = true

            return { isValid }
        } catch( _e ) {
            return { isValid: false }
        }
    }
}


export { RegistrationValidator }
