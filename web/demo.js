const ctx = document.getElementById('lineChart').getContext('2d');
const ctx1 = document.getElementById('lineChart1').getContext('2d');
// Dữ liệu ban đầu
var initialLabels = Array();
const initialData = Array();
var initialLabels1 = Array();
const initialData1 = Array();
// Tạo biểu đồ
const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: initialLabels,
        datasets: [{
            label: 'Độ ẩm theo thời gian thực',
            data: initialData,
            borderColor: 'rgb(42, 50, 192)',
            backgroundColor: 'rgba(151, 26, 26, 0.2)',
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Độ ẩm'
                }
            }
        }
    }
});
const lineChart1 = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: initialLabels1,
        datasets: [{
            label: 'Nhiệt độ theo thời gian thực',
            data: initialData1,
            borderColor: 'rgb(204, 47, 81)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Thời gian'
                }
                
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Nhiệt độ'
                }
            }
        }
    }
});

// Hàm cập nhật dữ liệu
function updateChart(currentTime, randomValue) {
    // Thêm nhãn và dữ liệu mới
    const now = new Date(currentTime);
    const timeString = now.toLocaleTimeString('en-US');
    var dataX = JSON.parse(randomValue);
    document.getElementById('realtimedoam').innerHTML = ` ${dataX['Độ ẩm']}%`;
    document.getElementById('realtimenhietdo').innerHTML = ` ${dataX['Nhiệt độ']}°C`;
    lineChart.data.labels.push(timeString);
    lineChart.data.datasets[0].data.push(dataX['Độ ẩm']);
    lineChart1.data.labels.push(timeString);
    lineChart1.data.datasets[0].data.push(dataX['Nhiệt độ']);
    // Giữ số lượng dữ liệu tối đa (vd: 10 điểm)
    if (lineChart.data.labels.length > 10) {
        lineChart.data.labels.shift(); // Xóa nhãn cũ nhất
        lineChart.data.datasets[0].data.shift(); // Xóa dữ liệu cũ nhất
    }
    if (lineChart1.data.labels.length > 10) {
        lineChart1.data.labels.shift(); // Xóa nhãn cũ nhất
        lineChart1.data.datasets[0].data.shift(); // Xóa dữ liệu cũ nhất
    }

    // Cập nhật biểu đồ
    lineChart.update();
    lineChart1.update();
}

// Cập nhật mỗi 1 giây


function startConnect() {

    clientID = "clientID - " + parseInt(Math.random() * 10000);

    host = document.getElementById("host").value;
    port = document.getElementById("port").value;
    userId = document.getElementById("username").value;
    passwordId = document.getElementById("password").value;

    document.getElementById("messages").innerHTML += "<span> Connecting to " + host + "on port " + port + "</span><br>";
    document.getElementById("messages").innerHTML += "<span> Using the client Id " + clientID + " </span><br>";

    client = new Paho.MQTT.Client("wss://" + host + ":" + port + "/mqtt", clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    client.connect({
        onSuccess: onConnect,
        userName: userId,
        password: passwordId,
    });


}

function onConnect() {
    topic = document.getElementById("topic_s").value;

    document.getElementById("messages").innerHTML += "<span> Subscribing to topic " + topic + "</span><br>";

    client.subscribe(topic);

}



function onConnectionLost(responseObject) {
    document.getElementById("messages").innerHTML += "<span> ERROR: Connection is lost.</span><br>";
    if (responseObject != 0) {
        document.getElementById("messages").innerHTML += "<span> ERROR:" + responseObject.errorMessage + "</span><br>";
    }
}

function onMessageArrived(message) {
    console.log(JSON.parse(message.payloadString));
    updateChart(Date.now(), message.payloadString);
    console.log("OnMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += "<span> Topic:" + message.destinationName + "| Message : " + message.payloadString + "</span><br>";
}

function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += "<span> Disconnected. </span><br>";

}

function publishMessage() {
    msg = document.getElementById("Message").value;
    topic = document.getElementById("topic_p").value;

    Message = new Paho.MQTT.Message(msg);
    Message.destinationName = topic;

    client.send(Message);
    document.getElementById("messages").innerHTML += "<span> Message to topic " + topic + ": " + msg + "</span><br>";

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


// xử lý select