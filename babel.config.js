module.exports = {
  'presets': [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  'plugins': [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-react-jsx-source',
    '@babel/plugin-proposal-object-rest-spread',
    // Stage 1
    '@babel/plugin-proposal-export-default-from',
    ['@babel/plugin-proposal-optional-chaining', { 'loose': false }],
    ['@babel/plugin-proposal-pipeline-operator', { 'proposal': 'minimal' }]
  ],
}
