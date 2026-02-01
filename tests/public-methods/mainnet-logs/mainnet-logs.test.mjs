import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Erc8004RegistryParser } from '../../../src/index.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const FIXTURE_PATH = resolve( __dirname, '../../helpers/mainnet-event-logs.json' )
const fixture = JSON.parse( readFileSync( FIXTURE_PATH, 'utf-8' ) )

const ALL_LOGS = [
    ...fixture.registeredLogs,
    ...fixture.uriUpdatedLogs
]

const EXPECTED_CATEGORY_KEYS = [
    'isEmpty', 'isBase64', 'isHttp', 'isIpfs', 'isJson',
    'isGzip', 'isUnknown', 'isParseable', 'isSpecCompliant',
    'isX402', 'isMcp', 'isA2A', 'isActive'
]

const EXPECTED_ENTRY_KEYS = [
    'agentId', 'ownerAddress', 'uriAgentType', 'name', 'description',
    'x402Support', 'services', 'mcpEndpoint', 'a2aEndpoint',
    'image', 'active', 'supportedTrust', 'raw'
]


describe( 'Mainnet Event Logs — start() smoke test', () => {

    test( 'processes all logs without exceptions', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }

                expect( () => {
                    Erc8004RegistryParser.start( { eventLog } )
                } ).not.toThrow()
            } )
    } )


    test( 'every result has status as boolean', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const result = Erc8004RegistryParser.start( { eventLog } )

                expect( typeof result.status ).toBe( 'boolean' )
            } )
    } )


    test( 'every result has messages as array', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const result = Erc8004RegistryParser.start( { eventLog } )

                expect( Array.isArray( result.messages ) ).toBe( true )
            } )
    } )
} )


describe( 'Mainnet Event Logs — decodeEventLog()', () => {

    test( 'decodes all logs successfully (real ERC-8004 events)', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { status } = Erc8004RegistryParser.decodeEventLog( { eventLog } )

                expect( status ).toBe( true )
            } )
    } )


    test( 'extracts agentId as numeric string from every log', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { agentId } = Erc8004RegistryParser.decodeEventLog( { eventLog } )

                expect( agentId ).not.toBeNull()
                expect( Number.isNaN( Number( agentId ) ) ).toBe( false )
            } )
    } )


    test( 'extracts ownerAddress as checksummed address from every log', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { ownerAddress } = Erc8004RegistryParser.decodeEventLog( { eventLog } )

                expect( ownerAddress ).not.toBeNull()
                expect( ownerAddress.startsWith( '0x' ) ).toBe( true )
                expect( ownerAddress.length ).toBe( 42 )
            } )
    } )


    test( 'decodedAgentUri is always a string', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { decodedAgentUri } = Erc8004RegistryParser.decodeEventLog( { eventLog } )

                expect( typeof decodedAgentUri ).toBe( 'string' )
            } )
    } )
} )


describe( 'Mainnet Event Logs — categories structure', () => {

    test( 'every result contains all 13 category keys', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const keys = Object.keys( categories )

                EXPECTED_CATEGORY_KEYS
                    .forEach( ( key ) => {
                        expect( keys ).toContain( key )
                    } )
            } )
    } )


    test( 'boolean category values are boolean or null (isActive)', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )

                EXPECTED_CATEGORY_KEYS
                    .forEach( ( key ) => {
                        const value = categories[key]

                        if( key === 'isActive' ) {
                            expect( value === true || value === false || value === null ).toBe( true )
                        } else {
                            expect( typeof value ).toBe( 'boolean' )
                        }
                    } )
            } )
    } )


    test( 'exactly one URI-type flag is true per log (or isEmpty)', () => {
        const uriTypeKeys = [ 'isBase64', 'isHttp', 'isIpfs', 'isJson', 'isGzip', 'isUnknown', 'isEmpty' ]

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const trueCount = uriTypeKeys
                    .filter( ( key ) => categories[key] === true )
                    .length

                expect( trueCount ).toBe( 1 )
            } )
    } )
} )


describe( 'Mainnet Event Logs — entries structure', () => {

    test( 'every result contains all 13 entry keys', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { entries } = Erc8004RegistryParser.start( { eventLog } )
                const keys = Object.keys( entries )

                EXPECTED_ENTRY_KEYS
                    .forEach( ( key ) => {
                        expect( keys ).toContain( key )
                    } )
            } )
    } )


    test( 'entries.services is always an array', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { entries } = Erc8004RegistryParser.start( { eventLog } )

                expect( Array.isArray( entries['services'] ) ).toBe( true )
            } )
    } )


    test( 'entries.agentId and ownerAddress are extracted from every log', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { entries } = Erc8004RegistryParser.start( { eventLog } )

                expect( entries['agentId'] ).not.toBeNull()
                expect( entries['ownerAddress'] ).not.toBeNull()
            } )
    } )
} )


describe( 'Mainnet Event Logs — URI type coverage', () => {

    test( 'fixture contains base64 logs', () => {
        const hasBase64 = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isBase64'] === true

                return result
            } )

        expect( hasBase64 ).toBe( true )
    } )


    test( 'fixture contains HTTP logs', () => {
        const hasHttp = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isHttp'] === true

                return result
            } )

        expect( hasHttp ).toBe( true )
    } )


    test( 'fixture contains IPFS logs', () => {
        const hasIpfs = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isIpfs'] === true

                return result
            } )

        expect( hasIpfs ).toBe( true )
    } )


    test( 'fixture contains gzip logs', () => {
        const hasGzip = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isGzip'] === true

                return result
            } )

        expect( hasGzip ).toBe( true )
    } )


    test( 'fixture contains inline JSON logs', () => {
        const hasJson = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isJson'] === true

                return result
            } )

        expect( hasJson ).toBe( true )
    } )


    test( 'fixture contains empty URI logs', () => {
        const hasEmpty = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isEmpty'] === true

                return result
            } )

        expect( hasEmpty ).toBe( true )
    } )


    test( 'fixture contains unknown URI logs', () => {
        const hasUnknown = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isUnknown'] === true

                return result
            } )

        expect( hasUnknown ).toBe( true )
    } )
} )


describe( 'Mainnet Event Logs — spec compliance and protocols', () => {

    test( 'fixture contains both spec-compliant and non-compliant logs', () => {
        let specCompliantCount = 0
        let nonCompliantCount = 0

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )

                if( categories['isSpecCompliant'] ) {
                    specCompliantCount += 1
                } else {
                    nonCompliantCount += 1
                }
            } )

        expect( specCompliantCount ).toBeGreaterThan( 0 )
        expect( nonCompliantCount ).toBeGreaterThan( 0 )
    } )


    test( 'fixture contains logs with MCP services', () => {
        const hasMcp = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isMcp'] === true

                return result
            } )

        expect( hasMcp ).toBe( true )
    } )


    test( 'fixture contains logs with A2A services', () => {
        const hasA2a = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isA2A'] === true

                return result
            } )

        expect( hasA2a ).toBe( true )
    } )


    test( 'fixture contains logs with x402 support', () => {
        const hasX402 = ALL_LOGS
            .some( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )
                const result = categories['isX402'] === true

                return result
            } )

        expect( hasX402 ).toBe( true )
    } )


    test( 'fixture contains active, inactive, and null active states', () => {
        let hasActive = false
        let hasInactive = false
        let hasNull = false

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { categories } = Erc8004RegistryParser.start( { eventLog } )

                if( categories['isActive'] === true ) { hasActive = true }
                if( categories['isActive'] === false ) { hasInactive = true }
                if( categories['isActive'] === null ) { hasNull = true }
            } )

        expect( hasActive ).toBe( true )
        expect( hasInactive ).toBe( true )
        expect( hasNull ).toBe( true )
    } )
} )


describe( 'Mainnet Event Logs — Registered vs URIUpdated', () => {

    test( 'fixture contains both event types', () => {
        expect( fixture.registeredLogs.length ).toBeGreaterThan( 0 )
        expect( fixture.uriUpdatedLogs.length ).toBeGreaterThan( 0 )
    } )


    test( 'Registered logs use correct topic0', () => {
        const registeredTopic = '0xca52e62c367d81bb2e328eb795f7c7ba24afb478408a26c0e201d155c449bc4a'

        fixture.registeredLogs
            .forEach( ( log ) => {
                expect( log.topics[0] ).toBe( registeredTopic )
            } )
    } )


    test( 'URIUpdated logs use correct topic0', () => {
        const uriUpdatedTopic = '0x3a2c7fffc2cba7582c690e3b82c453ea02a308326a98a3ad7576c606336409fb'

        fixture.uriUpdatedLogs
            .forEach( ( log ) => {
                expect( log.topics[0] ).toBe( uriUpdatedTopic )
            } )
    } )


    test( 'all logs target the correct contract address', () => {
        ALL_LOGS
            .forEach( ( log ) => {
                expect( log.address.toLowerCase() ).toBe( fixture.contract.toLowerCase() )
            } )
    } )
} )


describe( 'Mainnet Event Logs — validation messages for parseable logs', () => {

    test( 'parseable logs with spec deviations produce specific messages', () => {
        const knownDeviationPatterns = [
            'Uses "name" instead of spec-defined "type"',
            'Uses "endpoint" instead of spec-defined "url"',
            'Uses lowercase "x402support"',
            'Missing required field',
            'Unknown field not defined in ERC-8004 spec',
            'Unknown protocol'
        ]

        let matchedPatterns = 0

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { messages } = Erc8004RegistryParser.start( { eventLog } )

                messages
                    .forEach( ( msg ) => {
                        const matchesKnown = knownDeviationPatterns
                            .some( ( pattern ) => msg.includes( pattern ) )

                        if( matchesKnown ) {
                            matchedPatterns += 1
                        }
                    } )
            } )

        expect( matchedPatterns ).toBeGreaterThan( 0 )
    } )


    test( 'MCP endpoints are extracted where present', () => {
        let mcpCount = 0

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { entries, categories } = Erc8004RegistryParser.start( { eventLog } )

                if( categories['isMcp'] ) {
                    expect( entries['mcpEndpoint'] ).not.toBeNull()
                    expect( typeof entries['mcpEndpoint'] ).toBe( 'string' )
                    mcpCount += 1
                }
            } )

        expect( mcpCount ).toBeGreaterThan( 0 )
    } )


    test( 'A2A endpoints are extracted where present', () => {
        let a2aCount = 0

        ALL_LOGS
            .forEach( ( log ) => {
                const eventLog = { topics: log.topics, data: log.data }
                const { entries, categories } = Erc8004RegistryParser.start( { eventLog } )

                if( categories['isA2A'] ) {
                    expect( entries['a2aEndpoint'] ).not.toBeNull()
                    expect( typeof entries['a2aEndpoint'] ).toBe( 'string' )
                    a2aCount += 1
                }
            } )

        expect( a2aCount ).toBeGreaterThan( 0 )
    } )
} )
