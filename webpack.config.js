const path = require('path');

module.exports = {
    entry: {
        main_bundle: './Main/Main.js',
        client_bundle: './Client/Client.js',
        extension_bundle: './Extension/extension.js',
        service_bundle: './Storage/StorageWorker.js',
    }, // Root file that imports all modules
    output: {
        filename: '[name].js', // Single bundled output file
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
};
