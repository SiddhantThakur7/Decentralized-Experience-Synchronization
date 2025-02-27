const path = require('path');

module.exports = {
    entry: {
        test_bundle: './session-creation.js',
        test_bundle_inclusion: './session-inclusion.js',
    }, // Root file that imports all modules
    output: {
        filename: '[name].js', // Single bundled output file
        path: path.resolve(__dirname, 'public', 'js'),
    },
    mode: 'production',
};
