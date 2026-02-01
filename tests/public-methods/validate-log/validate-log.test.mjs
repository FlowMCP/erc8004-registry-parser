import { Erc8004RegistryParser } from '../../../src/index.mjs'

import {
    REGISTERED_LOG_BASE64,
    REGISTERED_LOG_EMPTY,
    UNKNOWN_EVENT_LOG,
    LOG_SHORT_DATA,
    LOG_MISSING_TOPICS,
    LOG_MISSING_DATA,
    AGENT_ID_STRING,
    OWNER_ADDRESS,
    VALID_BASE64_URI,
    SPEC_COMPLIANT_CATEGORIES,
    EMPTY_URI_CATEGORIES
} from '../../helpers/config.mjs'


describe( 'Erc8004RegistryParser.start', () => {

    test( 'validates log with spec-compliant base64 URI', () => {
        const { status, messages, categories, entries } = Erc8004RegistryParser.start( { eventLog: REGISTERED_LOG_BASE64 } )

        expect( status ).toBe( true )
        expect( messages ).toEqual( [] )
        expect( categories ).toEqual( SPEC_COMPLIANT_CATEGORIES )
        expect( entries['agentId'] ).toBe( AGENT_ID_STRING )
        expect( entries['ownerAddress'] ).toBe( OWNER_ADDRESS )
        expect( entries['name'] ).toBe( 'Test Agent' )
        expect( entries['mcpEndpoint'] ).toBe( 'https://mcp.example.com' )
    } )


    test( 'validates log with empty URI', () => {
        const { status, messages, categories, entries } = Erc8004RegistryParser.start( { eventLog: REGISTERED_LOG_EMPTY } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'uri: Is empty, agent has no Registration File' )
        expect( categories['isEmpty'] ).toBe( true )
        expect( entries['agentId'] ).toBe( AGENT_ID_STRING )
        expect( entries['ownerAddress'] ).toBe( OWNER_ADDRESS )
    } )


    test( 'rejects unknown event topic0', () => {
        const { status, messages } = Erc8004RegistryParser.start( { eventLog: UNKNOWN_EVENT_LOG } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'log.topics[0]: Unknown event signature, not a recognized ERC-8004 event' )
    } )


    test( 'rejects missing topics', () => {
        const { status, messages } = Erc8004RegistryParser.start( { eventLog: LOG_MISSING_TOPICS } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'log: Missing or empty topics array' )
    } )


    test( 'rejects missing data field', () => {
        const { status, messages } = Erc8004RegistryParser.start( { eventLog: LOG_MISSING_DATA } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'log: Missing data field' )
    } )


    test( 'rejects short data field', () => {
        const { status, messages } = Erc8004RegistryParser.start( { eventLog: LOG_SHORT_DATA } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'log.data: Too short for ABI-encoded string (minimum 66 bytes)' )
    } )


    test( 'throws on null eventLog parameter', () => {
        expect( () => {
            Erc8004RegistryParser.start( { eventLog: null } )
        } ).toThrow()
    } )


    test( 'throws on missing eventLog parameter', () => {
        expect( () => {
            Erc8004RegistryParser.start( { } )
        } ).toThrow()
    } )


    test( 'accepts additionalValidators parameter', () => {
        const mockMcpValidator = {
            validate: ( { endpoint } ) => {
                return { status: false, messages: [ 'Server not reachable' ] }
            }
        }
        const { messages } = Erc8004RegistryParser.start( {
            eventLog: REGISTERED_LOG_BASE64,
            additionalValidators: { mcp: mockMcpValidator }
        } )

        expect( messages ).toContain( 'services[0].url (MCP): Server not reachable' )
    } )
} )


describe( 'Erc8004RegistryParser.decodeEventLog', () => {

    test( 'decodes valid Registered log', () => {
        const { status, messages, agentId, ownerAddress, decodedAgentUri } = Erc8004RegistryParser.decodeEventLog( { eventLog: REGISTERED_LOG_BASE64 } )

        expect( status ).toBe( true )
        expect( messages ).toEqual( [] )
        expect( agentId ).toBe( AGENT_ID_STRING )
        expect( ownerAddress ).toBe( OWNER_ADDRESS )
        expect( decodedAgentUri ).toBe( VALID_BASE64_URI )
    } )


    test( 'decodes log with empty URI', () => {
        const { status, decodedAgentUri } = Erc8004RegistryParser.decodeEventLog( { eventLog: REGISTERED_LOG_EMPTY } )

        expect( status ).toBe( true )
        expect( decodedAgentUri ).toBe( '' )
    } )


    test( 'rejects unknown event', () => {
        const { status, messages } = Erc8004RegistryParser.decodeEventLog( { eventLog: UNKNOWN_EVENT_LOG } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'log.topics[0]: Unknown event signature, not a recognized ERC-8004 event' )
    } )
} )
