const db = [{ email: 'abc', password: '123', publicKey: '' }];

const findOne = ({ email, password }) => {
    return db.find(({ email: dbEmail, password: dbPassword }) => dbEmail === email && dbPassword === password)
}


const insertOne = ({ email, password, publicKey }) => {
    db.push({ publicKey, email, password });
    console.log('db', db)
    return true
}

const findRegister = ({ email }) => {
    return db.find(({ email: dbEmail, }) => dbEmail === email)
}

const updateOne = (email, data) => {
    const idx = db.findIndex(({ email: dbEmail, }) => dbEmail === email)
    db[idx] = {
        ...db[idx],
        data,
    };
    return db[idx];
}

// email: DataTypes.INTEGER,
// external_id: DataTypes.STRING,
// public_key
const passKeyDb = []

const findOneByExternalId = (id) => {
    return passKeyDb.find(({ external_id }) => external_id === id)
}

const createOneForPasskey = ({ email, external_id, public_key }) => {
    passKeyDb.push({
        email,
        external_id,
        public_key,
    });
    console.log('createOneForPasskey success', passKeyDb)
}


module.exports = {
    db,
    findOne,
    findRegister,
    insertOne,
    updateOne,
    findOneByExternalId,
    createOneForPasskey
}