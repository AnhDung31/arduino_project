function startConnect(){

    clientID = "clientID - "+parseInt(Math.random() * 10000);

    host = document.getElementById("host").value;   
    port = document.getElementById("port").value;  
    userId  = document.getElementById("username").value;  
    passwordId = document.getElementById("password").value;  

    document.getElementById("messages").innerHTML += "<span> Connecting to " + host + "on port " +port+"</span><br>";
    document.getElementById("messages").innerHTML += "<span> Using the client Id " + clientID +" </span><br>";

    client = new Paho.MQTT.Client("wss://" + host + ":" + port+ "/mqtt", clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        onSuccess: onConnect,
        userName: userId,
        password: passwordId,
    });


}

function onConnect(){
    topic =  document.getElementById("topic_s").value;

    document.getElementById("messages").innerHTML += "<span> Subscribing to topic "+topic + "</span><br>";

    client.subscribe(topic);

}



function onConnectionLost(responseObject){
    document.getElementById("messages").innerHTML += "<span> ERROR: Connection is lost.</span><br>";
    if(responseObject !=0){
        document.getElementById("messages").innerHTML += "<span> ERROR:"+ responseObject.errorMessage +"</span><br>";
    }
}

function onMessageArrived(message){
    console.log("OnMessageArrived: "+message.payloadString);
    document.getElementById("messages").innerHTML += "<span> Topic:"+message.destinationName+"| Message : "+message.payloadString + "</span><br>";
}

function startDisconnect(){
    client.disconnect();
    document.getElementById("messages").innerHTML += "<span> Disconnected. </span><br>";

}

function publishMessage(){
msg = document.getElementById("Message").value;
topic = document.getElementById("topic_p").value;

Message = new Paho.MQTT.Message(msg);
Message.destinationName = topic;

client.send(Message);
document.getElementById("messages").innerHTML += "<span> Message to topic "+topic+": " + msg + "</span><br>";

}
function turnOnLed() {
    msg = "HIGH";
    topic = "web/control";

    Message = new Paho.MQTT.Message(msg);
    Message.destinationName = topic;

    client.send(Message);
    document.getElementById("messages").innerHTML += "<span> TURN ON LED" + "</span><br>";

}

function turnOffLed() {
    msg = "LOW";
    topic = "web/control";

    Message = new Paho.MQTT.Message(msg);
    Message.destinationName = topic;

    client.send(Message);
    document.getElementById("messages").innerHTML += "<span> TURN OFF LED" + "</span><br>";

}

function isClientConnected() {
    return client.isConnected();
}

function validateForm() {
    if (!isClientConnected()) {
        alert("Client is not connected !.");
        return false;
    }
    else return true;
}