const API_HOST = 'http://localhost:3030'

const jsonHeader = new Headers();

jsonHeader.append("Content-Type", "application/json");


function base64_urlsafe_encode(buffer) {
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}


export const getUsers = () => fetch(`${API_HOST}/api/users`);


export const login = (data = {}) => fetch(`${API_HOST}/api/login`, {
    method: 'POST',
    mode: 'cors',
    headers: jsonHeader,
    body: JSON.stringify(data)
}).then(res => res.json());

export const register = (data = {}) => fetch(`${API_HOST}/api/register`, {
    method: 'POST',
    mode: 'cors',
    headers: jsonHeader,
    body: JSON.stringify(data)
}).then(res => res.json());


export const logout = () => fetch(`${API_HOST}/api/users`);


export const getChallenge = () => fetch('/api/login/public-key/challenge', {
    method: 'POST',
    headers: {
        Accept: 'application/json',
    },
}).then(res => res.json())


export const loginByPublicKey = (userCredentials) => fetch('/api/login/public-key', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildLoginOptionsWith(userCredentials))
})


const buildLoginOptionsWith = (userCredentials) => {
    const body = {
        id: userCredentials.id,
        response: {
            clientDataJSON: base64_urlsafe_encode(userCredentials.response.clientDataJSON),
            authenticatorData: base64_urlsafe_encode(userCredentials.response.authenticatorData),
            attestationObject: base64_urlsafe_encode(userCredentials.response.attestationObject),
            signature: base64_urlsafe_encode(userCredentials.response.signature),
            userHandle: userCredentials.response.signature ? base64_urlsafe_encode(userCredentials.response.signature) : null,
        },
    }

    if (userCredentials.authenticatorAttachment) {
        body.authenticatorAttachment =
            userCredentials.authenticatorAttachment
    }

    return body
}


// 注册 passkey
export const registerPasskey = (userCredentials, email) => fetch('/api/register/public-key/challenge', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...buildLoginOptionsWith(userCredentials), email })
}).then(res => res.json())
