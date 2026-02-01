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
    INVALID_BASE64_URI,
    UNKNOWN_URI,
    SPEC_COMPLIANT_JSON,
    REAL_WORLD_JSON
} from '../../helpers/config.mjs'


describe( 'Erc8004RegistryParser.decodeUri', () => {

    test( 'decodes spec-compliant base64 URI', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: VALID_BASE64_URI } )

        expect( status ).toBe( true )
        expect( messages ).toEqual( [] )
        expect( decodedRegistrationFile ).toEqual( SPEC_COMPLIANT_JSON )
    } )


    test( 'decodes real-world base64 URI', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: REAL_WORLD_BASE64_URI } )

        expect( status ).toBe( true )
        expect( messages ).toEqual( [] )
        expect( decodedRegistrationFile ).toEqual( REAL_WORLD_JSON )
    } )


    test( 'returns error for invalid base64 URI', () => {
        const { status, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: INVALID_BASE64_URI } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
    } )


    test( 'decodes inline JSON URI', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: INLINE_JSON_URI } )

        expect( status ).toBe( true )
        expect( messages ).toEqual( [] )
        expect( decodedRegistrationFile['name'] ).toBe( 'Inline Agent' )
    } )


    test( 'returns error for invalid inline JSON', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: '{invalid json}' } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
        expect( messages ).toContain( 'uri: Contains inline JSON but parsing failed' )
    } )


    test( 'returns empty URI message', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: EMPTY_URI } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
        expect( messages ).toContain( 'uri: Is empty, agent has no Registration File' )
    } )


    test( 'returns HTTP not resolved message', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: HTTP_URI } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
        expect( messages ).toContain( 'uri: HTTP URL detected, metadata not resolved (requires fetch)' )
    } )


    test( 'returns IPFS not resolved message for valid CID', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: IPFS_URI_VALID } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
        expect( messages ).toContain( 'uri: IPFS URI detected, metadata not resolved (requires gateway)' )
    } )


    test( 'returns IPFS warning for Ethereum address CID', () => {
        const { status, messages } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: IPFS_URI_ETH_ADDRESS } )

        expect( status ).toBe( false )
        expect( messages ).toContain( 'uri: IPFS CID looks like an Ethereum address, not a valid content hash' )
        expect( messages ).toContain( 'uri: IPFS URI detected, metadata not resolved (requires gateway)' )
    } )


    test( 'handles gzip URI', () => {
        const { status, messages } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: GZIP_URI } )

        expect( typeof status ).toBe( 'boolean' )
        expect( Array.isArray( messages ) ).toBe( true )
    } )


    test( 'returns unknown format message', () => {
        const { status, messages, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: UNKNOWN_URI } )

        expect( status ).toBe( false )
        expect( decodedRegistrationFile ).toBeNull()
        expect( messages ).toContain( 'uri: Unknown format, cannot classify' )
    } )


    test( 'accepts explicit uriAgentType parameter', () => {
        const { status, decodedRegistrationFile } = Erc8004RegistryParser.decodeUri( { decodedAgentUri: VALID_BASE64_URI, uriAgentType: 'base64' } )

        expect( status ).toBe( true )
        expect( decodedRegistrationFile ).toEqual( SPEC_COMPLIANT_JSON )
    } )
} )
