// --- Event Signatures ---

const REGISTERED_TOPIC0 = '0xca52e62c367d81bb2e328eb795f7c7ba24afb478408a26c0e201d155c449bc4a'
const URI_UPDATED_TOPIC0 = '0x3a2c7fffc2cba7582c690e3b82c453ea02a308326a98a3ad7576c606336409fb'


// --- Agent ID and Owner ---

const AGENT_ID_42_TOPIC = '0x000000000000000000000000000000000000000000000000000000000000002a'
const OWNER_TOPIC = '0x0000000000000000000000008ec6c9a8a6b0d69f48734c4b7ecd1cbb190a0d69'
const OWNER_ADDRESS = '0x8Ec6C9A8A6b0d69f48734c4b7Ecd1cbb190a0D69'
const AGENT_ID_STRING = '42'


// --- Spec-Compliant Registration File ---

const SPEC_COMPLIANT_JSON = {
    name: 'Test Agent',
    description: 'A test agent',
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
    services: [ { type: 'mcp', url: 'https://mcp.example.com' } ],
    x402Support: true,
    active: true
}

const SPEC_COMPLIANT_BASE64 = 'eyJuYW1lIjoiVGVzdCBBZ2VudCIsImRlc2NyaXB0aW9uIjoiQSB0ZXN0IGFnZW50IiwidHlwZSI6Imh0dHBzOi8vZWlwcy5ldGhlcmV1bS5vcmcvRUlQUy9laXAtODAwNCNyZWdpc3RyYXRpb24tdjEiLCJzZXJ2aWNlcyI6W3sidHlwZSI6Im1jcCIsInVybCI6Imh0dHBzOi8vbWNwLmV4YW1wbGUuY29tIn1dLCJ4NDAyU3VwcG9ydCI6dHJ1ZSwiYWN0aXZlIjp0cnVlfQ=='


// --- Real-World Registration File (Spec Deviations) ---

const REAL_WORLD_JSON = {
    name: 'Real Agent',
    description: 'A real agent',
    services: [ { name: 'MCP', endpoint: 'https://mcp.example.com' } ],
    x402support: true
}

const REAL_WORLD_BASE64 = 'eyJuYW1lIjoiUmVhbCBBZ2VudCIsImRlc2NyaXB0aW9uIjoiQSByZWFsIGFnZW50Iiwic2VydmljZXMiOlt7Im5hbWUiOiJNQ1AiLCJlbmRwb2ludCI6Imh0dHBzOi8vbWNwLmV4YW1wbGUuY29tIn1dLCJ4NDAyc3VwcG9ydCI6dHJ1ZX0='


// --- URI Strings ---

const VALID_BASE64_URI = `data:application/json;base64,${SPEC_COMPLIANT_BASE64}`
const REAL_WORLD_BASE64_URI = `data:application/json;base64,${REAL_WORLD_BASE64}`
const HTTP_URI = 'https://myagent.com/.well-known/erc8004.json'
const IPFS_URI_VALID = 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
const IPFS_URI_ETH_ADDRESS = 'ipfs://0x8ec6c9a8a6b0d69f48734c4b7ecd1cbb190a0d69'
const GZIP_URI = 'data:application/json;enc=gzip;level=6;base64,H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVRSizIULJRKs9ILUpVslIqzy9KSQUAVcHkNSUAAAA='
const INLINE_JSON_URI = '{"name":"Inline Agent","description":"An inline agent"}'
const EMPTY_URI = ''
const INVALID_BASE64_URI = 'data:application/json;base64,!!!invalid-base64!!!'
const UNKNOWN_URI = 'ftp://some.server.com/file.json'


// --- ABI-Encoded Data (for Event Logs) ---

const ABI_ENCODED_SPEC_URI = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000135646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c65794a755957316c496a6f695647567a644342425a32567564434973496d526c63324e796158423061573975496a6f69515342305a584e304947466e5a5735304969776964486c775a534936496d68306448427a4f6938765a576c776379356c6447686c636d563162533576636d637652556c515579396c615841744f4441774e434e795a576470633352795958527062323474646a45694c434a7a5a584a3261574e6c637949365733736964486c775a534936496d316a63434973496e567962434936496d68306448427a4f69387662574e774c6d5634595731776247557559323974496e31644c434a344e44417955335677634739796443493664484a315a53776959574e3061585a6c496a7030636e566c66513d3d0000000000000000000000'

const ABI_ENCODED_EMPTY_URI = '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'


// --- Raw Event Logs ---

const REGISTERED_LOG_BASE64 = {
    topics: [
        REGISTERED_TOPIC0,
        AGENT_ID_42_TOPIC,
        OWNER_TOPIC
    ],
    data: ABI_ENCODED_SPEC_URI
}

const REGISTERED_LOG_EMPTY = {
    topics: [
        REGISTERED_TOPIC0,
        AGENT_ID_42_TOPIC,
        OWNER_TOPIC
    ],
    data: ABI_ENCODED_EMPTY_URI
}

const UNKNOWN_EVENT_LOG = {
    topics: [
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        AGENT_ID_42_TOPIC,
        OWNER_TOPIC
    ],
    data: ABI_ENCODED_SPEC_URI
}

const LOG_SHORT_DATA = {
    topics: [
        REGISTERED_TOPIC0,
        AGENT_ID_42_TOPIC,
        OWNER_TOPIC
    ],
    data: '0x0000000000000000'
}

const LOG_MISSING_TOPICS = {
    topics: [],
    data: ABI_ENCODED_SPEC_URI
}

const LOG_MISSING_DATA = {
    topics: [
        REGISTERED_TOPIC0,
        AGENT_ID_42_TOPIC,
        OWNER_TOPIC
    ]
}


// --- Expected Results ---

const SPEC_COMPLIANT_CATEGORIES = {
    isEmpty: false,
    isBase64: true,
    isHttp: false,
    isIpfs: false,
    isJson: false,
    isGzip: false,
    isUnknown: false,
    isParseable: true,
    isSpecCompliant: true,
    isX402: true,
    isMcp: true,
    isA2A: false,
    isActive: true
}

const REAL_WORLD_CATEGORIES = {
    isEmpty: false,
    isBase64: true,
    isHttp: false,
    isIpfs: false,
    isJson: false,
    isGzip: false,
    isUnknown: false,
    isParseable: true,
    isSpecCompliant: false,
    isX402: true,
    isMcp: true,
    isA2A: false,
    isActive: null
}

const REAL_WORLD_EXPECTED_MESSAGES = [
    'type: Missing required field (expected "https://eips.ethereum.org/EIPS/eip-8004#registration-v1")',
    'services[0].name: Uses "name" instead of spec-defined "type"',
    'services[0].endpoint: Uses "endpoint" instead of spec-defined "url"',
    'x402support: Uses lowercase "x402support" instead of spec-defined "x402Support"'
]

const EMPTY_URI_CATEGORIES = {
    isEmpty: true,
    isBase64: false,
    isHttp: false,
    isIpfs: false,
    isJson: false,
    isGzip: false,
    isUnknown: false,
    isParseable: false,
    isSpecCompliant: false,
    isX402: false,
    isMcp: false,
    isA2A: false,
    isActive: null
}

const HTTP_URI_CATEGORIES = {
    isEmpty: false,
    isBase64: false,
    isHttp: true,
    isIpfs: false,
    isJson: false,
    isGzip: false,
    isUnknown: false,
    isParseable: false,
    isSpecCompliant: false,
    isX402: false,
    isMcp: false,
    isA2A: false,
    isActive: null
}

const IPFS_URI_CATEGORIES = {
    isEmpty: false,
    isBase64: false,
    isHttp: false,
    isIpfs: true,
    isJson: false,
    isGzip: false,
    isUnknown: false,
    isParseable: false,
    isSpecCompliant: false,
    isX402: false,
    isMcp: false,
    isA2A: false,
    isActive: null
}


// --- Spec Constants ---

const SPEC_TYPE_VALUE = 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1'

const KNOWN_PROTOCOLS = [ 'mcp', 'a2a', 'oasf', 'ens', 'did' ]

const KNOWN_TRUST_TYPES = [ 'reputation', 'crypto-economic', 'tee-attestation' ]

const KNOWN_SPEC_FIELDS = [
    'type', 'name', 'description', 'image', 'services',
    'x402Support', 'active', 'supportedTrust'
]


export {
    REGISTERED_TOPIC0,
    URI_UPDATED_TOPIC0,
    AGENT_ID_42_TOPIC,
    OWNER_TOPIC,
    OWNER_ADDRESS,
    AGENT_ID_STRING,
    SPEC_COMPLIANT_JSON,
    SPEC_COMPLIANT_BASE64,
    REAL_WORLD_JSON,
    REAL_WORLD_BASE64,
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
    ABI_ENCODED_SPEC_URI,
    ABI_ENCODED_EMPTY_URI,
    REGISTERED_LOG_BASE64,
    REGISTERED_LOG_EMPTY,
    UNKNOWN_EVENT_LOG,
    LOG_SHORT_DATA,
    LOG_MISSING_TOPICS,
    LOG_MISSING_DATA,
    SPEC_COMPLIANT_CATEGORIES,
    REAL_WORLD_CATEGORIES,
    REAL_WORLD_EXPECTED_MESSAGES,
    EMPTY_URI_CATEGORIES,
    HTTP_URI_CATEGORIES,
    IPFS_URI_CATEGORIES,
    SPEC_TYPE_VALUE,
    KNOWN_PROTOCOLS,
    KNOWN_TRUST_TYPES,
    KNOWN_SPEC_FIELDS
}
