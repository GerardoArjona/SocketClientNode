const io = require('socket.io-client');
let readline = require('readline');

if(process.argv[2] === undefined){
    console.log("ERROR: Enter a server ip with port")
    process.exit()
}

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
    const client =  data
    //console.log(client)
    console.log("CLIENT DATA:")
    console.log("\tName: " + client.name)
    console.log("\tAccount: " + client.account)
    console.log("\tBalance: " + client.balance)
    console.log("Enter a command:")
})

socket.on('balance_data', data =>{
    console.clear() 
    const balance =  data
    //console.log(client)
    console.log("BALANCE:")
    console.log("\tOld: " + balance.old)
    console.log("\tNew: " + balance.new)
    console.log("Enter a command:")
})

rl.on('line', function(line){
    socket.emit('command', line)
})
