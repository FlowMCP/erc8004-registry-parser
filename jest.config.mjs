export default {
    testEnvironment: 'node',
    transform: {},
    verbose: true,
    roots: [ './tests' ],
    collectCoverageFrom: [ 'src/**/*.mjs' ],
    coverageReporters: [ 'text', 'lcov', 'html' ]
}
