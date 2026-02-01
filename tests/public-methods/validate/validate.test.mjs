import { Erc8004RegistryParser } from '../../../src/index.mjs'

import {
    VALID_BASE64_URI,
    REAL_WORLD_BASE64_URI,
    HTTP_URI,
    IPFS_URI_VALID,
    IPFS_URI_ETH_ADDRESS,
    GZIP_URI,
    EMPTY_URI,
    SPEC_COMPLIANT_JSON,
    REAL_WORLD_JSON,
    REAL_WORLD_EXPECTED_MESSAGES,
    SPEC_COMPLIANT_CATEGORIES,
    REAL_WORLD_CATEGORIES,
    EMPTY_URI_CATEGORIES,
    HTTP_URI_CATEGORIES,
    IPFS_URI_CATEGORIES,
    SPEC_TYPE_VALUE
} from '../../helpers/config.mjs'


describe( 'Erc8004RegistryParser.validateFromUri', () => {

    describe( 'Spec-Compliant base64', () => {

        test( 'validates spec-compliant base64 URI as passing', () => {
            const { status, messages, categories, entries } = Erc8004RegistryParser.validateFromUri( { agentUri: VALID_BASE64_URI } )

            expect( status ).toBe( true )
            expect( messages ).toEqual( [] )
            expect( categories ).toEqual( SPEC_COMPLIANT_CATEGORIES )
            expect( entries['name'] ).toBe( 'Test Agent' )
            expect( entries['mcpEndpoint'] ).toBe( 'https://mcp.example.com' )
        } )
    } )


    describe( 'Real-World base64 (Spec Deviations)', () => {

        test( 'detects all real-world deviations', () => {
            const { status, messages, categories } = Erc8004RegistryParser.validateFromUri( { agentUri: REAL_WORLD_BASE64_URI } )

            expect( status ).toBe( false )
            expect( messages ).toEqual( REAL_WORLD_EXPECTED_MESSAGES )
            expect( categories ).toEqual( REAL_WORLD_CATEGORIES )
        } )
    } )


    describe( 'Empty URI', () => {

        test( 'returns empty URI message and categories', () => {
            const { status, messages, categories } = Erc8004RegistryParser.validateFromUri( { agentUri: EMPTY_URI } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'uri: Is empty, agent has no Registration File' )
            expect( categories ).toEqual( EMPTY_URI_CATEGORIES )
        } )
    } )


    describe( 'HTTP URI', () => {

        test( 'returns HTTP not resolved message', () => {
            const { status, messages, categories } = Erc8004RegistryParser.validateFromUri( { agentUri: HTTP_URI } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'uri: HTTP URL detected, metadata not resolved (requires fetch)' )
            expect( categories ).toEqual( HTTP_URI_CATEGORIES )
        } )
    } )


    describe( 'IPFS URI', () => {

        test( 'returns IPFS not resolved message', () => {
            const { status, messages, categories } = Erc8004RegistryParser.validateFromUri( { agentUri: IPFS_URI_VALID } )

            expect( status ).toBe( false )
            expect( messages ).toContain( 'uri: IPFS URI detected, metadata not resolved (requires gateway)' )
            expect( categories ).toEqual( IPFS_URI_CATEGORIES )
        } )


        test( 'warns about Ethereum address CID', () => {
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: IPFS_URI_ETH_ADDRESS } )

            expect( messages ).toContain( 'uri: IPFS CID looks like an Ethereum address, not a valid content hash' )
        } )
    } )


    describe( 'Gzip URI', () => {

        test( 'handles gzip URI', () => {
            const { status, messages } = Erc8004RegistryParser.validateFromUri( { agentUri: GZIP_URI } )

            expect( typeof status ).toBe( 'boolean' )
            expect( Array.isArray( messages ) ).toBe( true )
        } )
    } )


    describe( 'Stufe 2: Required Fields via validateFromUri()', () => {

        const makeUri = ( json ) => {
            const b64 = Buffer.from( JSON.stringify( json ) ).toString( 'base64' )
            const uri = `data:application/json;base64,${b64}`

            return uri
        }

        test( 'detects missing type field', () => {
            const uri = makeUri( { name: 'Agent', description: 'Desc' } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( `type: Missing required field (expected "${SPEC_TYPE_VALUE}")` )
        } )


        test( 'detects missing name field', () => {
            const uri = makeUri( { type: SPEC_TYPE_VALUE, description: 'Desc' } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'name: Missing required field' )
        } )


        test( 'detects missing description field', () => {
            const uri = makeUri( { type: SPEC_TYPE_VALUE, name: 'Agent' } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'description: Missing field' )
        } )
    } )


    describe( 'Stufe 3: Services via validateFromUri()', () => {

        const makeUri = ( json ) => {
            const b64 = Buffer.from( JSON.stringify( json ) ).toString( 'base64' )
            const uri = `data:application/json;base64,${b64}`

            return uri
        }

        test( 'detects name instead of type in services', () => {
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                services: [ { name: 'MCP', url: 'https://example.com' } ]
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'services[0].name: Uses "name" instead of spec-defined "type"' )
        } )


        test( 'detects endpoint instead of url in services', () => {
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                services: [ { type: 'mcp', endpoint: 'https://example.com' } ]
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'services[0].endpoint: Uses "endpoint" instead of spec-defined "url"' )
        } )
    } )


    describe( 'Stufe 4: x402 via validateFromUri()', () => {

        const makeUri = ( json ) => {
            const b64 = Buffer.from( JSON.stringify( json ) ).toString( 'base64' )
            const uri = `data:application/json;base64,${b64}`

            return uri
        }

        test( 'detects lowercase x402support', () => {
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                x402support: true
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'x402support: Uses lowercase "x402support" instead of spec-defined "x402Support"' )
        } )
    } )


    describe( 'Stufe 5: Optional Fields via validateFromUri()', () => {

        const makeUri = ( json ) => {
            const b64 = Buffer.from( JSON.stringify( json ) ).toString( 'base64' )
            const uri = `data:application/json;base64,${b64}`

            return uri
        }

        test( 'detects extra unknown fields', () => {
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                customField: 'value'
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( messages ).toContain( 'customField: Unknown field not defined in ERC-8004 spec' )
        } )
    } )


    describe( 'Stufe 6: External Validators', () => {

        const makeUri = ( json ) => {
            const b64 = Buffer.from( JSON.stringify( json ) ).toString( 'base64' )
            const uri = `data:application/json;base64,${b64}`

            return uri
        }

        test( 'calls MCP validator and includes messages', () => {
            const mockMcpValidator = {
                validate: ( { endpoint } ) => {
                    return { status: false, messages: [ 'Server not reachable' ] }
                }
            }
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                services: [ { type: 'mcp', url: 'https://mcp.example.com' } ]
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri, additionalValidators: { mcp: mockMcpValidator } } )

            expect( messages ).toContain( 'services[0].url (MCP): Server not reachable' )
        } )


        test( 'calls A2A validator and includes messages', () => {
            const mockA2AValidator = {
                validate: ( { endpoint } ) => {
                    return { status: false, messages: [ 'Agent card not found' ] }
                }
            }
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                services: [ { type: 'a2a', url: 'https://a2a.example.com' } ]
            } )
            const { messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri, additionalValidators: { a2a: mockA2AValidator } } )

            expect( messages ).toContain( 'services[0].url (A2A): Agent card not found' )
        } )


        test( 'skips validators when not provided', () => {
            const uri = makeUri( {
                type: SPEC_TYPE_VALUE,
                name: 'Agent',
                description: 'Desc',
                services: [ { type: 'mcp', url: 'https://mcp.example.com' } ]
            } )
            const { status, messages } = Erc8004RegistryParser.validateFromUri( { agentUri: uri } )

            expect( status ).toBe( true )
            expect( messages ).toEqual( [] )
        } )
    } )


    describe( 'Entries extraction via validateFromUri()', () => {

        test( 'includes agentId and ownerAddress when provided', () => {
            const { entries } = Erc8004RegistryParser.validateFromUri( {
                agentUri: VALID_BASE64_URI,
                agentId: '42',
                ownerAddress: '0x8Ec6C9A8A6b0d69f48734c4b7Ecd1cbb190a0D69'
            } )

            expect( entries['agentId'] ).toBe( '42' )
            expect( entries['ownerAddress'] ).toBe( '0x8Ec6C9A8A6b0d69f48734c4b7Ecd1cbb190a0D69' )
        } )


        test( 'includes raw JSON string', () => {
            const { entries } = Erc8004RegistryParser.validateFromUri( { agentUri: VALID_BASE64_URI } )

            expect( entries['raw'] ).toBeTruthy()
            expect( typeof entries['raw'] ).toBe( 'string' )
        } )
    } )


    describe( 'Parameter Validation', () => {

        test( 'throws on non-string agentUri', () => {
            expect( () => {
                Erc8004RegistryParser.validateFromUri( { agentUri: 123 } )
            } ).toThrow()
        } )


        test( 'throws on non-object additionalValidators', () => {
            expect( () => {
                Erc8004RegistryParser.validateFromUri( { agentUri: '', additionalValidators: 'invalid' } )
            } ).toThrow()
        } )
    } )
} )
