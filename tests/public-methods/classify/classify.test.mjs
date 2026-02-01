import { Erc8004RegistryParser } from '../../../src/index.mjs'

import {
    VALID_BASE64_URI,
    REAL_WORLD_BASE64_URI,
    HTTP_URI,
    IPFS_URI_VALID,
    IPFS_URI_ETH_ADDRESS,
    GZIP_URI,
    INLINE_JSON_URI,
    EMPTY_URI,
    UNKNOWN_URI
} from '../../helpers/config.mjs'


describe( 'Erc8004RegistryParser.classifyUri', () => {

    test( 'classifies empty string as empty', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: EMPTY_URI } )

        expect( uriAgentType ).toBe( 'empty' )
    } )


    test( 'classifies null as empty', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: null } )

        expect( uriAgentType ).toBe( 'empty' )
    } )


    test( 'throws on undefined decodedAgentUri', () => {
        expect( () => {
            Erc8004RegistryParser.classifyUri( { decodedAgentUri: undefined } )
        } ).toThrow( 'decodedAgentUri: Missing value' )
    } )


    test( 'classifies gzip data URI as gzip', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: GZIP_URI } )

        expect( uriAgentType ).toBe( 'gzip' )
    } )


    test( 'classifies spec-compliant base64 data URI as base64', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: VALID_BASE64_URI } )

        expect( uriAgentType ).toBe( 'base64' )
    } )


    test( 'classifies real-world base64 data URI as base64', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: REAL_WORLD_BASE64_URI } )

        expect( uriAgentType ).toBe( 'base64' )
    } )


    test( 'classifies HTTP URL as http', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: HTTP_URI } )

        expect( uriAgentType ).toBe( 'http' )
    } )


    test( 'classifies http URL (lowercase) as http', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: 'http://example.com/agent.json' } )

        expect( uriAgentType ).toBe( 'http' )
    } )


    test( 'classifies valid IPFS URI as ipfs', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: IPFS_URI_VALID } )

        expect( uriAgentType ).toBe( 'ipfs' )
    } )


    test( 'classifies IPFS URI with Ethereum address as ipfs', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: IPFS_URI_ETH_ADDRESS } )

        expect( uriAgentType ).toBe( 'ipfs' )
    } )


    test( 'classifies inline JSON as json', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: INLINE_JSON_URI } )

        expect( uriAgentType ).toBe( 'json' )
    } )


    test( 'classifies JSON array as json', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: '[{"name":"test"}]' } )

        expect( uriAgentType ).toBe( 'json' )
    } )


    test( 'classifies unknown URI as unknown', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: UNKNOWN_URI } )

        expect( uriAgentType ).toBe( 'unknown' )
    } )


    test( 'classifies random string as unknown', () => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: 'just some random text' } )

        expect( uriAgentType ).toBe( 'unknown' )
    } )


    test( 'gzip detection takes priority over base64', () => {
        const gzipUri = 'data:application/json;enc=gzip;base64,H4sIAAAA'
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: gzipUri } )

        expect( uriAgentType ).toBe( 'gzip' )
    } )


    test( 'returns categories object', () => {
        const { categories } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: VALID_BASE64_URI } )

        expect( categories['isBase64'] ).toBe( true )
        expect( categories['isEmpty'] ).toBe( false )
    } )
} )
