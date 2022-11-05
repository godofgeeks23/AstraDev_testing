const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default: {
        SECRET: 'secret123',
        DATABASE: 'mongodb+srv://godofgeeks:1PrUEPEEp7hjbWWe@cluster0.gajdbpk.mongodb.net/?retryWrites=true&w=majority'
    }
}


exports.get = function get(env) {
    return config[env] || config.default
}