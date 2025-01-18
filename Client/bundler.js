const fs = require('fs');
const UglifyJS = require('uglify-js');

const mainFiles = [
    "./Constants/Constants.js",
    "./Player/Platforms/NetflixPlayer.js",
    "./Player/Platforms/YouTubePlayer.js",
    "./Player/Player.js",
    "./Socket/Socket.js",
    "./Signalling/Server.js",
    "./Signalling/SignallingServer.js",
    "./Connections/PeerConnectionEntity.js",
    "./Connections/ExperienceSession.js",
    "./Storage/ChromeStorage.js",
    "./Utils.js",
    "./Connections/PeerEntity.js",
    "./Main/Main.js",
];

const clientFiles = [
    "Constants/Constants.js",
    "Player/Platforms/NetflixPlayer.js",
    "Player/Platforms/YouTubePlayer.js",
    "Player/Player.js",
    "Utils.js",
    "Client/client.js"
];


const bundle = (files, name) => {
    const combinedCode = files
        .filter(file => {
            if (!fs.existsSync(file)) {
                console.warn(`Warning: File not found - ${file}`);
                return false;
            }
            return true;
        })
        .map(file => fs.readFileSync(file, 'utf8'))
        .join('\n');

    const result = UglifyJS.minify(combinedCode, { compress: true, mangle: true });

    if (result.error) {
        console.error('Error during minification:', result.error);
    } else {
        fs.writeFileSync(`./build/${name}.js`, result.code, 'utf8');
        console.log('Bundled and minified code written to bundle.js');
    }
}

bundle(mainFiles, 'main_bundle');
bundle(clientFiles, 'client_bundle');