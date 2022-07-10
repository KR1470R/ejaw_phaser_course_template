const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: ["./src/scripts/game.ts"],
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        modules: ["node_modules", "src"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$|\.jsx?$/,
                include: path.join(__dirname, "../src"),
                loader: "ts-loader",
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                    filename: "[name].bundle.js",
                },
            },
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            gameName: "2048",
            template: "src/index.html",
            serviceWorker: `<script type="module">
					if ('serviceWorker' in navigator) {
						window.addEventListener('load', () => {
							navigator.serviceWorker.register('./sw.js');
						});
					}
				</script>`,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
                { from: "pwa", to: "" },
                { from: "src/favicon.ico", to: "" },
            ],
        }),
    ],
};
