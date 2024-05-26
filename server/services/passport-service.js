const passport = require('passport')
const WebAuthnStrategy = require('passport-fido2-webauthn')
const { findOneByExternalId, findOne, createOneForPasskey } = require('../db')


class PassportService {
    init(store) {
        // 1. configure passport to use WebAuthn Strategy
        passport.use(this.useWebauthnStrategy(store))
        // 2. passport serialise user
        //   passport.serializeUser(this.serialiseUserFn)
        // 3. passport deserialise user
        //   passport.deserializeUser(this.deserialiseUserFn)
    }

    useWebauthnStrategy(store) {
        return new WebAuthnStrategy(
            { store: store },
            this.verify,
            this.register
        )
    }

    verify(id, userHandle, cb) {
        console.log('user',id)
        const result = findOneByExternalId(id);
        if (!result) {
            return done(null, false, { message: 'Invalid key. ' })
        }
        const currentUser = findOne(result.email)
        if (currentUser === null) {
            return done(null, false, { message: 'No such user. ' })
        }

        if (Buffer.compare(currentUser.handle, userHandle) != 0) {
            return done(null, false, { message: 'Handles do not match. ' })
        }

        return done(null, currentCredentials, result.public_key)
    }

    async register(user, id, publicKey, done) {
        
        try {
            const newUser = findOne(user.email)

            if (newUser === null) {
                return done(null, false, { message: 'Could not create user. ' })
            }

            const newCredentials = createOneForPasskey(
                {
                    email: newUser.email,
                    external_id: id,
                    public_key: publicKey,
                }
            )

            if (newCredentials === null) {
                return done(null, false, { message: 'Could not create public key. ' })
            }

            return done(null, newUser)
        } catch (error) {
            throw error
        }
    }
}

module.exports = PassportService;