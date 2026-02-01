import { AbiCoder, getAddress } from 'ethers'


const REGISTERED_TOPIC0 = '0xca52e62c367d81bb2e328eb795f7c7ba24afb478408a26c0e201d155c449bc4a'
const URI_UPDATED_TOPIC0 = '0x3a2c7fffc2cba7582c690e3b82c453ea02a308326a98a3ad7576c606336409fb'

const KNOWN_TOPIC0S = [ REGISTERED_TOPIC0, URI_UPDATED_TOPIC0 ]

const MIN_DATA_HEX_LENGTH = 66


class EventDecoder {


    static decode( { eventLog } ) {
        const messages = []

        const { valid: topicsValid } = EventDecoder.#validateTopics( { eventLog, messages } )
        if( !topicsValid ) {
            return { status: false, messages, agentId: null, ownerAddress: null, decodedAgentUri: null }
        }

        const { valid: dataValid } = EventDecoder.#validateData( { eventLog, messages } )
        if( !dataValid ) {
            return { status: false, messages, agentId: null, ownerAddress: null, decodedAgentUri: null }
        }

        const { agentId } = EventDecoder.#extractAgentId( { topic: eventLog['topics'][1], messages } )
        const { ownerAddress } = EventDecoder.#extractOwnerAddress( { topic: eventLog['topics'][2], messages } )

        if( messages.length > 0 ) {
            return { status: false, messages, agentId, ownerAddress, decodedAgentUri: null }
        }

        const { decodedAgentUri } = EventDecoder.#decodeAbiString( { data: eventLog['data'], messages } )

        if( messages.length > 0 ) {
            return { status: false, messages, agentId, ownerAddress, decodedAgentUri }
        }

        return { status: true, messages, agentId, ownerAddress, decodedAgentUri }
    }


    static #validateTopics( { eventLog, messages } ) {
        if( !eventLog || !eventLog['topics'] || !Array.isArray( eventLog['topics'] ) || eventLog['topics'].length === 0 ) {
            messages.push( 'log: Missing or empty topics array' )

            return { valid: false }
        }

        const topic0 = eventLog['topics'][0]
        if( !KNOWN_TOPIC0S.includes( topic0 ) ) {
            messages.push( 'log.topics[0]: Unknown event signature, not a recognized ERC-8004 event' )

            return { valid: false }
        }

        return { valid: true }
    }


    static #validateData( { eventLog, messages } ) {
        if( eventLog['data'] === undefined || eventLog['data'] === null ) {
            messages.push( 'log: Missing data field' )

            return { valid: false }
        }

        const hexLength = eventLog['data'].length
        if( hexLength < MIN_DATA_HEX_LENGTH ) {
            messages.push( `log.data: Too short for ABI-encoded string (minimum 66 bytes)` )

            return { valid: false }
        }

        return { valid: true }
    }


    static #extractAgentId( { topic, messages } ) {
        try {
            const agentIdBigInt = BigInt( topic )
            const agentId = agentIdBigInt.toString()

            return { agentId }
        } catch( _e ) {
            messages.push( 'log.topics[1]: Cannot decode as uint256 agentId' )

            return { agentId: null }
        }
    }


    static #extractOwnerAddress( { topic, messages } ) {
        try {
            const addressHex = '0x' + topic.slice( 26 )
            const ownerAddress = getAddress( addressHex )

            return { ownerAddress }
        } catch( _e ) {
            messages.push( 'log.topics[2]: Cannot decode as address' )

            return { ownerAddress: null }
        }
    }


    static #decodeAbiString( { data, messages } ) {
        try {
            const abiCoder = AbiCoder.defaultAbiCoder()
            const decoded = abiCoder.decode( [ 'string' ], data )
            const decodedAgentUri = decoded[0]

            return { decodedAgentUri }
        } catch( _e ) {
            messages.push( 'log.data: ABI string decoding failed' )

            return { decodedAgentUri: null }
        }
    }
}


export { EventDecoder }
