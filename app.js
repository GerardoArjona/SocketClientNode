const io = require('socket.io-client');
let readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');

if(process.argv[2] === undefined){
    console.log("ERROR: Enter a server ip with port")
    process.exit()
}

const encrypt = (publicKey, message) => {
    //console.log(publicKey)
    let enc = crypto.publicEncrypt({
    key: publicKey,
    padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message));
    return enc.toString('base64');
};


const decrypt = (privateKey, message) => {
    let enc = crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.RSA_PKCS1_OAEP_PADDING
    }, Buffer.from(message, 'base64'));
    return enc.toString();
};

const socket = io(process.argv[2]);
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

socket.on('connect', () => {
    console.log("Connected to server!")
    socket.emit('connected', 'Connected from client!')
    console.log("Enter a command:")
});

socket.on('command_received', data =>{
    console.log("COMMAND STATUS: " + data)
})

socket.on('client_data', data =>{
    console.clear() 
    let clientPrivate = fs.readFileSync('keys/client.private.pem');
    // console.log(data)
    let client = decrypt(clientPrivate, data);
    client = JSON.parse(client)
    //console.log(client)
    console.log("CLIENT DATA:")
    console.log("\tName: " + client.name)
    console.log("\tAccount: " + client.account)
    console.log("\tBalance: " + client.balance)
    console.log("Enter a command:")
})

socket.on('balance_data', data =>{
    console.clear() 
    let clientPrivate = fs.readFileSync('keys/client.private.pem');
    // console.log(data)
    let balance = decrypt(clientPrivate, data);
    balance = JSON.parse(balance)
    //console.log(client)
    console.log("BALANCE:")
    console.log("\tOld: " + balance.old)
    console.log("\tNew: " + balance.new)
    console.log("Enter a command:")
})

socket.on('disconnect_message', data =>{
    console.clear() 
    console.log("SERVER MESSAGE: " + data)
    process.exit()
})

rl.on('line', function(line){
    socket.emit('command', line)
})