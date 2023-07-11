module.exports = {
    apps : [{
        name: 'ecertificate',
        script: 'dist/index.js',
        interpreter_args: "-r dotenv/config",
        watch: false,
    }]
};