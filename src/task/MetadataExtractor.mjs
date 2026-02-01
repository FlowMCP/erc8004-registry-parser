const SPEC_TYPE_VALUE = 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1'


class MetadataExtractor {


    static extract( { decodedRegistrationFile, uriAgentType, agentId = null, ownerAddress = null } ) {
        if( decodedRegistrationFile === null || decodedRegistrationFile === undefined ) {
            const categories = MetadataExtractor.#buildEmptyCategories( { uriAgentType } )
            const entries = MetadataExtractor.#buildEmptyEntries( { uriAgentType, agentId, ownerAddress } )

            return { categories, entries }
        }

        const categories = MetadataExtractor.#buildCategories( { decodedRegistrationFile, uriAgentType } )
        const entries = MetadataExtractor.#buildEntries( { decodedRegistrationFile, uriAgentType, agentId, ownerAddress } )

        return { categories, entries }
    }


    static #buildCategories( { decodedRegistrationFile, uriAgentType } ) {
        const { hasX402 } = MetadataExtractor.#detectX402( { decodedRegistrationFile } )
        const { hasMcp, hasA2A } = MetadataExtractor.#detectProtocols( { decodedRegistrationFile } )
        const { isSpecCompliant } = MetadataExtractor.#checkSpecCompliance( { decodedRegistrationFile } )
        const activeValue = decodedRegistrationFile['active'] !== undefined ? decodedRegistrationFile['active'] : null

        const categories = {
            isEmpty: false,
            isBase64: uriAgentType === 'base64',
            isHttp: uriAgentType === 'http',
            isIpfs: uriAgentType === 'ipfs',
            isJson: uriAgentType === 'json',
            isGzip: uriAgentType === 'gzip',
            isUnknown: uriAgentType === 'unknown',
            isParseable: true,
            isSpecCompliant,
            isX402: hasX402,
            isMcp: hasMcp,
            isA2A: hasA2A,
            isActive: typeof activeValue === 'boolean' ? activeValue : null
        }

        return categories
    }


    static #buildEmptyCategories( { uriAgentType } ) {
        const categories = {
            isEmpty: uriAgentType === 'empty',
            isBase64: uriAgentType === 'base64',
            isHttp: uriAgentType === 'http',
            isIpfs: uriAgentType === 'ipfs',
            isJson: uriAgentType === 'json',
            isGzip: uriAgentType === 'gzip',
            isUnknown: uriAgentType === 'unknown',
            isParseable: false,
            isSpecCompliant: false,
            isX402: false,
            isMcp: false,
            isA2A: false,
            isActive: null
        }

        return categories
    }


    static #buildEntries( { decodedRegistrationFile, uriAgentType, agentId, ownerAddress } ) {
        const { mcpEndpoint, a2aEndpoint } = MetadataExtractor.#extractEndpoints( { decodedRegistrationFile } )
        const { services } = MetadataExtractor.#extractServices( { decodedRegistrationFile } )
        const { hasX402, x402Value } = MetadataExtractor.#detectX402( { decodedRegistrationFile } )

        const entries = {
            agentId: agentId || null,
            ownerAddress: ownerAddress || null,
            uriAgentType,
            name: decodedRegistrationFile['name'] || null,
            description: decodedRegistrationFile['description'] || null,
            x402Support: hasX402 ? x402Value : false,
            services,
            mcpEndpoint,
            a2aEndpoint,
            image: decodedRegistrationFile['image'] || null,
            active: decodedRegistrationFile['active'] !== undefined ? decodedRegistrationFile['active'] : null,
            supportedTrust: decodedRegistrationFile['supportedTrust'] || null,
            raw: JSON.stringify( decodedRegistrationFile )
        }

        return entries
    }


    static #buildEmptyEntries( { uriAgentType, agentId, ownerAddress } ) {
        const entries = {
            agentId: agentId || null,
            ownerAddress: ownerAddress || null,
            uriAgentType,
            name: null,
            description: null,
            x402Support: false,
            services: [],
            mcpEndpoint: null,
            a2aEndpoint: null,
            image: null,
            active: null,
            supportedTrust: null,
            raw: null
        }

        return entries
    }


    static #detectX402( { decodedRegistrationFile } ) {
        const hasCorrectCase = decodedRegistrationFile['x402Support'] !== undefined
        const hasLowerCase = decodedRegistrationFile['x402support'] !== undefined

        if( hasCorrectCase ) {
            return { hasX402: decodedRegistrationFile['x402Support'] === true, x402Value: decodedRegistrationFile['x402Support'] }
        }

        if( hasLowerCase ) {
            return { hasX402: decodedRegistrationFile['x402support'] === true, x402Value: decodedRegistrationFile['x402support'] }
        }

        return { hasX402: false, x402Value: false }
    }


    static #detectProtocols( { decodedRegistrationFile } ) {
        const services = decodedRegistrationFile['services']
        if( !Array.isArray( services ) || services.length === 0 ) {
            return { hasMcp: false, hasA2A: false }
        }

        let hasMcp = false
        let hasA2A = false

        services
            .forEach( ( service ) => {
                const protocol = ( service['type'] || service['name'] || '' ).toLowerCase()
                if( protocol === 'mcp' ) { hasMcp = true }
                if( protocol === 'a2a' ) { hasA2A = true }
            } )

        return { hasMcp, hasA2A }
    }


    static #checkSpecCompliance( { decodedRegistrationFile } ) {
        if( decodedRegistrationFile['type'] !== SPEC_TYPE_VALUE ) {
            return { isSpecCompliant: false }
        }

        if( !decodedRegistrationFile['name'] || typeof decodedRegistrationFile['name'] !== 'string' ) {
            return { isSpecCompliant: false }
        }

        if( decodedRegistrationFile['x402support'] !== undefined && decodedRegistrationFile['x402Support'] === undefined ) {
            return { isSpecCompliant: false }
        }

        if( Array.isArray( decodedRegistrationFile['services'] ) ) {
            const hasDeviation = decodedRegistrationFile['services']
                .some( ( service ) => {
                    const usesName = service['name'] !== undefined && service['type'] === undefined
                    const usesEndpoint = service['endpoint'] !== undefined && service['url'] === undefined
                    const result = usesName || usesEndpoint

                    return result
                } )

            if( hasDeviation ) {
                return { isSpecCompliant: false }
            }
        }

        return { isSpecCompliant: true }
    }


    static #extractEndpoints( { decodedRegistrationFile } ) {
        const services = decodedRegistrationFile['services']
        if( !Array.isArray( services ) || services.length === 0 ) {
            return { mcpEndpoint: null, a2aEndpoint: null }
        }

        let mcpEndpoint = null
        let a2aEndpoint = null

        services
            .forEach( ( service ) => {
                const protocol = ( service['type'] || service['name'] || '' ).toLowerCase()
                const endpoint = service['url'] || service['endpoint'] || null

                if( protocol === 'mcp' && mcpEndpoint === null ) { mcpEndpoint = endpoint }
                if( protocol === 'a2a' && a2aEndpoint === null ) { a2aEndpoint = endpoint }
            } )

        return { mcpEndpoint, a2aEndpoint }
    }


    static #extractServices( { decodedRegistrationFile } ) {
        const rawServices = decodedRegistrationFile['services']
        if( !Array.isArray( rawServices ) || rawServices.length === 0 ) {
            return { services: [] }
        }

        const services = rawServices
            .map( ( service ) => {
                const protocol = service['type'] || service['name'] || null
                const endpoint = service['url'] || service['endpoint'] || null
                const result = { protocol, endpoint }

                return result
            } )

        return { services }
    }
}


export { MetadataExtractor }
