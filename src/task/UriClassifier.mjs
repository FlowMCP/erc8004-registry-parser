class UriClassifier {


    static classify( { uri } ) {
        const { uriAgentType } = UriClassifier.#detectType( { uri } )

        return { uriAgentType }
    }


    static #detectType( { uri } ) {
        if( uri === undefined || uri === null || uri === '' ) {
            return { uriAgentType: 'empty' }
        }

        if( typeof uri !== 'string' ) {
            return { uriAgentType: 'unknown' }
        }

        const trimmed = uri.trim()

        if( trimmed === '' ) {
            return { uriAgentType: 'empty' }
        }

        if( trimmed.startsWith( 'data:' ) && trimmed.includes( 'enc=gzip' ) ) {
            return { uriAgentType: 'gzip' }
        }

        if( trimmed.startsWith( 'data:application/json;base64,' ) ) {
            return { uriAgentType: 'base64' }
        }

        if( trimmed.startsWith( 'https://' ) || trimmed.startsWith( 'http://' ) ) {
            return { uriAgentType: 'http' }
        }

        if( trimmed.startsWith( 'ipfs://' ) ) {
            return { uriAgentType: 'ipfs' }
        }

        const isJson = UriClassifier.#looksLikeJson( { value: trimmed } )
        if( isJson ) {
            return { uriAgentType: 'json' }
        }

        return { uriAgentType: 'unknown' }
    }


    static #looksLikeJson( { value } ) {
        const startsWithBrace = value.startsWith( '{' ) || value.startsWith( '[' )

        return startsWithBrace
    }
}


export { UriClassifier }
