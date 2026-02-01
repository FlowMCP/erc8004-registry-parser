import { gunzipSync } from 'node:zlib'


class UriDecoder {


    static decode( { uri, uriAgentType } ) {
        const messages = []

        if( uriAgentType === 'empty' ) {
            messages.push( 'uri: Is empty, agent has no Registration File' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        if( uriAgentType === 'http' ) {
            messages.push( 'uri: HTTP URL detected, metadata not resolved (requires fetch)' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        if( uriAgentType === 'ipfs' ) {
            const { hasEthAddress } = UriDecoder.#checkIpfsCid( { uri } )
            if( hasEthAddress ) {
                messages.push( 'uri: IPFS CID looks like an Ethereum address, not a valid content hash' )
            }
            messages.push( 'uri: IPFS URI detected, metadata not resolved (requires gateway)' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        if( uriAgentType === 'gzip' ) {
            const { status: gzipStatus, messages: gzipMessages, decodedRegistrationFile: gzipJson } = UriDecoder.#decodeGzip( { uri } )
            messages.push( ...gzipMessages )

            return { status: gzipStatus, messages, decodedRegistrationFile: gzipJson }
        }

        if( uriAgentType === 'base64' ) {
            const { status: b64Status, messages: b64Messages, decodedRegistrationFile: b64Json } = UriDecoder.#decodeBase64( { uri } )
            messages.push( ...b64Messages )

            return { status: b64Status, messages, decodedRegistrationFile: b64Json }
        }

        if( uriAgentType === 'json' ) {
            const { status: jsonStatus, messages: jsonMessages, decodedRegistrationFile: jsonResult } = UriDecoder.#decodeJson( { uri } )
            messages.push( ...jsonMessages )

            return { status: jsonStatus, messages, decodedRegistrationFile: jsonResult }
        }

        messages.push( 'uri: Unknown format, cannot classify' )

        return { status: false, messages, decodedRegistrationFile: null }
    }


    static #decodeBase64( { uri } ) {
        const messages = []
        const prefix = 'data:application/json;base64,'
        const b64String = uri.slice( prefix.length )

        let decoded
        try {
            const buffer = Buffer.from( b64String, 'base64' )
            decoded = buffer.toString( 'utf-8' )
        } catch( _e ) {
            messages.push( 'uri: Invalid base64 encoding' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        const { isValid } = UriDecoder.#isValidUtf8( { value: decoded, original: b64String } )
        if( !isValid ) {
            messages.push( 'uri: Decoded base64 is not valid UTF-8' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        let parsed
        try {
            parsed = JSON.parse( decoded )
        } catch( _e ) {
            messages.push( 'uri: Contains inline JSON but parsing failed' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        return { status: true, messages, decodedRegistrationFile: parsed }
    }


    static #decodeJson( { uri } ) {
        const messages = []

        let parsed
        try {
            parsed = JSON.parse( uri )
        } catch( _e ) {
            messages.push( 'uri: Contains inline JSON but parsing failed' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        return { status: true, messages, decodedRegistrationFile: parsed }
    }


    static #decodeGzip( { uri } ) {
        const messages = []

        const b64Match = uri.match( /base64,(.+)$/ )
        if( !b64Match ) {
            messages.push( 'uri: Gzip encoding detected but not decodable in this environment' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        let decompressed
        try {
            const compressed = Buffer.from( b64Match[1], 'base64' )
            decompressed = gunzipSync( compressed ).toString( 'utf-8' )
        } catch( _e ) {
            messages.push( 'uri: Gzip encoding detected but not decodable in this environment' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        let parsed
        try {
            parsed = JSON.parse( decompressed )
        } catch( _e ) {
            messages.push( 'uri: Contains inline JSON but parsing failed' )

            return { status: false, messages, decodedRegistrationFile: null }
        }

        return { status: true, messages, decodedRegistrationFile: parsed }
    }


    static #checkIpfsCid( { uri } ) {
        const cid = uri.replace( 'ipfs://', '' )
        const hasEthAddress = /^0x[0-9a-fA-F]{40}$/.test( cid )

        return { hasEthAddress }
    }


    static #isValidUtf8( { value, original } ) {
        const reEncoded = Buffer.from( value, 'utf-8' ).toString( 'base64' )
        const isValid = reEncoded === original

        return { isValid }
    }
}


export { UriDecoder }
