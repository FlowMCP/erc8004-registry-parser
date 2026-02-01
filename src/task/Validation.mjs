class Validation {


    static validationStart( { eventLog, additionalValidators } ) {
        const struct = { status: false, messages: [] }

        if( eventLog === undefined ) {
            struct['messages'].push( 'eventLog: Missing value' )
        } else if( eventLog === null || typeof eventLog !== 'object' || Array.isArray( eventLog ) ) {
            struct['messages'].push( 'eventLog: Must be an object' )
        }

        if( additionalValidators !== undefined && additionalValidators !== null ) {
            if( typeof additionalValidators !== 'object' || Array.isArray( additionalValidators ) ) {
                struct['messages'].push( 'additionalValidators: Must be an object' )
            }
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationValidateFromUri( { agentUri, agentId, ownerAddress, additionalValidators } ) {
        const struct = { status: false, messages: [] }

        if( agentUri === undefined ) {
            struct['messages'].push( 'agentUri: Missing value' )
        } else if( agentUri !== null && typeof agentUri !== 'string' ) {
            struct['messages'].push( 'agentUri: Must be a string or null' )
        }

        if( agentId !== undefined && agentId !== null && typeof agentId !== 'string' ) {
            struct['messages'].push( 'agentId: Must be a string or null' )
        }

        if( ownerAddress !== undefined && ownerAddress !== null && typeof ownerAddress !== 'string' ) {
            struct['messages'].push( 'ownerAddress: Must be a string or null' )
        }

        if( additionalValidators !== undefined && additionalValidators !== null ) {
            if( typeof additionalValidators !== 'object' || Array.isArray( additionalValidators ) ) {
                struct['messages'].push( 'additionalValidators: Must be an object' )
            }
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationClassifyUri( { decodedAgentUri } ) {
        const struct = { status: false, messages: [] }

        if( decodedAgentUri === undefined ) {
            struct['messages'].push( 'decodedAgentUri: Missing value' )
        } else if( decodedAgentUri !== null && typeof decodedAgentUri !== 'string' ) {
            struct['messages'].push( 'decodedAgentUri: Must be a string or null' )
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static validationDecodeUri( { decodedAgentUri, uriAgentType } ) {
        const struct = { status: false, messages: [] }

        if( decodedAgentUri === undefined ) {
            struct['messages'].push( 'decodedAgentUri: Missing value' )
        } else if( decodedAgentUri !== null && typeof decodedAgentUri !== 'string' ) {
            struct['messages'].push( 'decodedAgentUri: Must be a string or null' )
        }

        if( uriAgentType !== undefined && uriAgentType !== null && typeof uriAgentType !== 'string' ) {
            struct['messages'].push( 'uriAgentType: Must be a string or null' )
        }

        if( struct['messages'].length > 0 ) {
            return struct
        }

        struct['status'] = true

        return struct
    }


    static error( { messages } ) {
        const messageStr = messages.join( ', ' )

        throw new Error( messageStr )
    }
}


export { Validation }
