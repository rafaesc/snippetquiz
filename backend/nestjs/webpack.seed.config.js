const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './prisma/ai-content-service/seed.ts',
    mode: 'production',
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.seed.json',
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '../../generated/prisma/ai-content-service': path.resolve(__dirname, 'generated/prisma/ai-content-service'),
        },
    },
    output: {
        module: false,
        filename: 'seed.js',
        path: path.resolve(__dirname, 'dist/prisma/ai-content-service'),
    },
};
