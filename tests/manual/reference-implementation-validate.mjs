import { Erc8004RegistryParser } from '../../src/index.mjs'


// --- Example 1: Validate a spec-compliant base64 URI ---

const specCompliantUri = 'data:application/json;base64,eyJuYW1lIjoiVGVzdCBBZ2VudCIsImRlc2NyaXB0aW9uIjoiQSB0ZXN0IGFnZW50IiwidHlwZSI6Imh0dHBzOi8vZWlwcy5ldGhlcmV1bS5vcmcvRUlQUy9laXAtODAwNCNyZWdpc3RyYXRpb24tdjEiLCJzZXJ2aWNlcyI6W3sidHlwZSI6Im1jcCIsInVybCI6Imh0dHBzOi8vbWNwLmV4YW1wbGUuY29tIn1dLCJ4NDAyU3VwcG9ydCI6dHJ1ZSwiYWN0aXZlIjp0cnVlfQ=='

console.log( '\n--- Example 1: Spec-Compliant URI ---' )
const result1 = Erc8004RegistryParser.validateFromUri( { agentUri: specCompliantUri } )
console.log( `  Status: ${result1['status']}` )
console.log( `  Messages: ${result1['messages'].length === 0 ? 'none' : result1['messages'].join( '\n    ' )}` )
console.log( `  Name: ${result1['entries']['name']}` )
console.log( `  MCP Endpoint: ${result1['entries']['mcpEndpoint']}` )
console.log( `  x402: ${result1['categories']['isX402']}` )


// --- Example 2: Validate a real-world URI with deviations ---

const realWorldUri = 'data:application/json;base64,eyJuYW1lIjoiUmVhbCBBZ2VudCIsImRlc2NyaXB0aW9uIjoiQSByZWFsIGFnZW50Iiwic2VydmljZXMiOlt7Im5hbWUiOiJNQ1AiLCJlbmRwb2ludCI6Imh0dHBzOi8vbWNwLmV4YW1wbGUuY29tIn1dLCJ4NDAyc3VwcG9ydCI6dHJ1ZX0='

console.log( '\n--- Example 2: Real-World URI (Deviations) ---' )
const result2 = Erc8004RegistryParser.validateFromUri( { agentUri: realWorldUri } )
console.log( `  Status: ${result2['status']}` )
console.log( `  Messages:` )
result2['messages']
    .forEach( ( msg ) => {
        console.log( `    - ${msg}` )
    } )
console.log( `  Spec Compliant: ${result2['categories']['isSpecCompliant']}` )


// --- Example 3: Validate an empty URI ---

console.log( '\n--- Example 3: Empty URI ---' )
const result3 = Erc8004RegistryParser.validateFromUri( { agentUri: '' } )
console.log( `  Status: ${result3['status']}` )
console.log( `  isEmpty: ${result3['categories']['isEmpty']}` )
console.log( `  Messages: ${result3['messages'].join( ', ' )}` )


// --- Example 4: Classify URI types ---

console.log( '\n--- Example 4: Classify URIs ---' )
const uris = [
    'data:application/json;base64,eyJ0ZXN0IjoiMSJ9',
    'https://myagent.com/.well-known/erc8004.json',
    'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    '{"name":"Inline"}',
    ''
]

uris
    .forEach( ( uri ) => {
        const { uriAgentType } = Erc8004RegistryParser.classifyUri( { decodedAgentUri: uri } )
        const display = uri.length > 50 ? uri.substring( 0, 47 ) + '...' : ( uri || '(empty)' )

        console.log( `  ${display} → ${uriAgentType}` )
    } )


// --- Example 5: Decode a raw event log ---

console.log( '\n--- Example 5: Decode Event Log ---' )
const eventLog = {
    topics: [
        '0xca52e62c367d81bb2e328eb795f7c7ba24afb478408a26c0e201d155c449bc4a',
        '0x000000000000000000000000000000000000000000000000000000000000002a',
        '0x0000000000000000000000008ec6c9a8a6b0d69f48734c4b7ecd1cbb190a0d69'
    ],
    data: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
}
const result5 = Erc8004RegistryParser.decodeEventLog( { eventLog } )
console.log( `  Agent ID: ${result5['agentId']}` )
console.log( `  Owner: ${result5['ownerAddress']}` )
console.log( `  URI: ${result5['decodedAgentUri'] || '(empty)'}` )


// --- Example 6: Full start pipeline ---

console.log( '\n--- Example 6: Full start Pipeline ---' )
const result6 = Erc8004RegistryParser.start( { eventLog } )
console.log( `  Status: ${result6['status']}` )
console.log( `  Messages: ${result6['messages'].join( ', ' ) || 'none'}` )
console.log( `  Agent ID: ${result6['entries']['agentId']}` )

console.log( '\n--- Done ---\n' )
