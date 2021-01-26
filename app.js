// Se importan los módulos necesarios
const io = require('socket.io-client');
let readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');

if(process.argv[2] === undefined){
    console.log("ERROR: Enter a server ip with port")
    process.exit()
}

// Funciones para cifrar y descrifrar los mensajes enviados 
// y recibidos del server 
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

// Se crea socket con la ip ingresada por argumento del script
const socket = io(process.argv[2]);

// Se inicializa el lector de stdin en terminal
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

// Acción a ejecutar si la conexión es exitosa
socket.on('connect', () => {
    console.log("Connected to server!")
    socket.emit('connected', 'Connected from client!')
    console.log("Enter a command:")
});

// Acción a ejecutar si el servidor recibio el comando correctamente
socket.on('command_received', data =>{
    console.log("COMMAND STATUS: " + data)
})

// Acción a ejecutar si el servidor manda la información del usuario
socket.on('client_data', data =>{
    // Se descifra la información del usuario
    // y se muestra en consola
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

// Acción a ejecutar si el servidor manda el balance del usuario
socket.on('balance_data', data =>{
    // Se descifra el balance del usuario
    // y se muestra en consola
    // Si hay error muestra el error y el balance actual
    console.clear() 
    let clientPrivate = fs.readFileSync('keys/client.private.pem');
    // console.log(data)
    let balance = decrypt(clientPrivate, data);
    balance = JSON.parse(balance)
    //console.log(client)
    if(balance.error === true){
        console.log("BALANCE:")
        console.log("\t$" + balance.old)
        console.log("\tERROR: " + "Insufficient funds") 
    }else{
        console.log("BALANCE:")
        console.log("\tOld: $" + balance.old)
        console.log("\tNew: $" + balance.new)
    }
    console.log("Enter a command:")
})

// Acción a ejecutar si el termina la conexión
socket.on('disconnect_message', data =>{
    console.clear() 
    console.log("SERVER MESSAGE: " + data)
    process.exit()
})

// Acción a ejecutar cuando el cliente manda comando al servidor
rl.on('line', function(line){
    // Se lee lo ingresado por terminar
    // se cifra
    // y se manda al servidor
    let serverPublic = fs.readFileSync('keys/server.public.pem');
    let message = encrypt(serverPublic, line);
    socket.emit('command', message)
})