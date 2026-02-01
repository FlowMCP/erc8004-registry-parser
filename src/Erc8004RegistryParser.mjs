import { EventDecoder } from './task/EventDecoder.mjs'
import { MetadataExtractor } from './task/MetadataExtractor.mjs'
import { RegistrationValidator } from './task/RegistrationValidator.mjs'
import { UriClassifier } from './task/UriClassifier.mjs'
import { UriDecoder } from './task/UriDecoder.mjs'
import { Validation } from './task/Validation.mjs'


class Erc8004RegistryParser {


    static start( { eventLog, additionalValidators = {} } ) {
        const { status: paramStatus, messages: paramMessages } = Validation.validationStart( { eventLog, additionalValidators } )
        if( !paramStatus ) { Validation.error( { messages: paramMessages } ) }

        const allMessages = []

        const {
            status: decodeStatus,
            messages: decodeMessages,
            agentId,
            ownerAddress,
            decodedAgentUri
        } = EventDecoder.decode( { eventLog } )
        allMessages.push( ...decodeMessages )

        if( !decodeStatus || decodedAgentUri === null ) {
            const { categories } = MetadataExtractor.extract( { decodedRegistrationFile: null, uriAgentType: 'empty', agentId, ownerAddress } )
            const { entries } = MetadataExtractor.extract( { decodedRegistrationFile: null, uriAgentType: 'empty', agentId, ownerAddress } )

            const result = Erc8004RegistryParser.#buildResult( { messages: allMessages, categories, entries } )

            return result
        }

        const pipelineResult = Erc8004RegistryParser.#runPipeline( {
            decodedAgentUri,
            agentId,
            ownerAddress,
            additionalValidators
        } )

        allMessages.push( ...pipelineResult['messages'] )

        const result = {
            status: allMessages.length === 0,
            messages: allMessages,
            categories: pipelineResult['categories'],
            entries: pipelineResult['entries']
        }

        return result
    }


    static validateFromUri( { agentUri, agentId = null, ownerAddress = null, additionalValidators = {} } ) {
        const { status: paramStatus, messages: paramMessages } = Validation.validationValidateFromUri( { agentUri, agentId, ownerAddress, additionalValidators } )
        if( !paramStatus ) { Validation.error( { messages: paramMessages } ) }

        const pipelineResult = Erc8004RegistryParser.#runPipeline( {
            decodedAgentUri: agentUri,
            agentId,
            ownerAddress,
            additionalValidators
        } )

        const result = {
            status: pipelineResult['messages'].length === 0,
            messages: pipelineResult['messages'],
            categories: pipelineResult['categories'],
            entries: pipelineResult['entries']
        }

        return result
    }


    static classifyUri( { decodedAgentUri } ) {
        const { status: paramStatus, messages: paramMessages } = Validation.validationClassifyUri( { decodedAgentUri } )
        if( !paramStatus ) { Validation.error( { messages: paramMessages } ) }

        const { uriAgentType } = UriClassifier.classify( { uri: decodedAgentUri } )
        const { categories } = MetadataExtractor.extract( { decodedRegistrationFile: null, uriAgentType } )

        return { uriAgentType, categories }
    }


    static decodeUri( { decodedAgentUri, uriAgentType = null } ) {
        const { status: paramStatus, messages: paramMessages } = Validation.validationDecodeUri( { decodedAgentUri, uriAgentType } )
        if( !paramStatus ) { Validation.error( { messages: paramMessages } ) }

        const resolvedUriAgentType = uriAgentType || UriClassifier.classify( { uri: decodedAgentUri } )['uriAgentType']
        const { status, messages, decodedRegistrationFile } = UriDecoder.decode( { uri: decodedAgentUri, uriAgentType: resolvedUriAgentType } )

        return { status, messages, decodedRegistrationFile }
    }


    static decodeEventLog( { eventLog } ) {
        const { status: paramStatus, messages: paramMessages } = Validation.validationStart( { eventLog } )
        if( !paramStatus ) { Validation.error( { messages: paramMessages } ) }

        const { status, messages, agentId, ownerAddress, decodedAgentUri } = EventDecoder.decode( { eventLog } )

        return { status, messages, agentId, ownerAddress, decodedAgentUri }
    }


    static categorizeRegistration( { decodedRegistrationFile } ) {
        const { categories, entries } = MetadataExtractor.extract( { decodedRegistrationFile, uriAgentType: 'base64' } )

        return { categories, entries }
    }


    static #runPipeline( { decodedAgentUri, agentId, ownerAddress, additionalValidators } ) {
        const messages = []

        const { uriAgentType } = UriClassifier.classify( { uri: decodedAgentUri } )

        const {
            status: decodeStatus,
            messages: decodeMessages,
            decodedRegistrationFile
        } = UriDecoder.decode( { uri: decodedAgentUri, uriAgentType } )
        messages.push( ...decodeMessages )

        if( !decodeStatus || decodedRegistrationFile === null ) {
            const { categories, entries } = MetadataExtractor.extract( { decodedRegistrationFile: null, uriAgentType, agentId, ownerAddress } )

            return { messages, categories, entries }
        }

        const {
            messages: validationMessages
        } = RegistrationValidator.validate( { json: decodedRegistrationFile, uriType: uriAgentType } )
        messages.push( ...validationMessages )

        const { categories, entries } = MetadataExtractor.extract( { decodedRegistrationFile, uriAgentType, agentId, ownerAddress } )

        const { validatorMessages } = Erc8004RegistryParser.#runValidators( {
            additionalValidators,
            entries,
            decodedRegistrationFile
        } )
        messages.push( ...validatorMessages )

        return { messages, categories, entries }
    }


    static #runValidators( { additionalValidators, entries, decodedRegistrationFile } ) {
        const validatorMessages = []

        if( !additionalValidators || typeof additionalValidators !== 'object' ) {
            return { validatorMessages }
        }

        const services = decodedRegistrationFile['services']
        if( !Array.isArray( services ) || services.length === 0 ) {
            return { validatorMessages }
        }

        services
            .forEach( ( service, index ) => {
                const protocol = ( service['type'] || service['name'] || '' ).toLowerCase()
                const endpoint = service['url'] || service['endpoint'] || null

                if( endpoint === null ) {
                    return
                }

                if( protocol === 'mcp' && additionalValidators['mcp'] ) {
                    const { status, messages: mcpMessages } = additionalValidators['mcp'].validate( { endpoint } )
                    if( !status ) {
                        mcpMessages
                            .forEach( ( msg ) => {
                                validatorMessages.push( `services[${index}].url (MCP): ${msg}` )
                            } )
                    }
                }

                if( protocol === 'a2a' && additionalValidators['a2a'] ) {
                    const { status, messages: a2aMessages } = additionalValidators['a2a'].validate( { endpoint } )
                    if( !status ) {
                        a2aMessages
                            .forEach( ( msg ) => {
                                validatorMessages.push( `services[${index}].url (A2A): ${msg}` )
                            } )
                    }
                }
            } )

        return { validatorMessages }
    }


    static #buildResult( { messages, categories, entries } ) {
        const result = {
            status: messages.length === 0,
            messages,
            categories,
            entries
        }

        return result
    }
}


export { Erc8004RegistryParser }
