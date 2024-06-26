#include<ESP8266WiFi.h>
#include "DHTesp.h"
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

#define DHTpin 2
DHTesp dht;
int led = 4;
//------------------------------------------------
const char* ssid = "Esp8266_dht11";      //Wifi connect
const char* password = "anhdung3110";   //Password

const char* mqtt_server = "b45b0c700ea04cc08e6c8d0e4ac3e3de.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "dht11_project"; //Username
const char* mqtt_password = "Anhdung3110"; //Password
//--------------------------------------------------
WiFiClientSecure espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Kết nối tới mạng wifi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
//-----------------------------------------------------
//Kết nối MQTT Broker
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientID =  "ESPClient-";
    // Mã định danh để xác định nguồn gốc thiêt bị IoT gửi lên MQTT khi có nhiều IoT
    // Dùng địa chỉ MAC
    clientID += WiFi.macAddress();
    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      Serial.println(clientID);
      //topic được dùng để nhận thông tin từ MQTT
      client.subscribe("web/control");
    } else {
      Serial.print("Connection failed");
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
//---------------------------------------------------------
//Nhận thông tin từ MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  String Message = "";
  for(int i=0; i<length;i++) Message += (char)payload[i];
  Serial.println("Massage arived ["+String(topic)+"]: "+Message);
  if (Message == "HIGH") digitalWrite(led,HIGH); 
  else if (Message == "LOW") digitalWrite(led,LOW);
}

//------------------------------------------------------------------
//Đẩy thông tin lên MQTT
void publishMessage(const char* topic, String payload, boolean retained){
  if(client.publish(topic,payload.c_str(),true)) {  //
    Serial.println("Message published ["+String(topic)+"]: "+payload);
  }
}

//--------------------------------------------------------------------------
void setup() {
  Serial.begin(9600);

  pinMode(led,OUTPUT);
  digitalWrite(led,LOW);

  while(!Serial) delay(1);
  dht.setup(DHTpin,DHTesp::DHT11);
  setup_wifi();
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
//gọi hàm callback khi nhận được tin nhắn từ MQTT
  client.setCallback(callback);
}
// theo dõi thời gian cập nhật thông số từ sonsor
unsigned long timeUpdata=millis();
//---------------------------------------------------
void loop() {
  if (!client.connected()) {
    reconnect();
  }
//kết nối MQTT được duy trì, thiết lập lại nếu tin nhắn không gửi thành công
  client.loop();

  //read DHT11
  if(millis()-timeUpdata>5000){
    delay(dht.getMinimumSamplingPeriod());
    float humidity = dht.getHumidity();
    float tempurature = dht.getTemperature();
//Khởi tạo một tài liệu JSON động với kích thước tối đa là 1024 byte.
    DynamicJsonDocument doc(1024);
//Gán giá trị độ ẩm, nhiệt độ vào trường "humidity", "temperature" của tài liệu JSON.
    doc["Độ ẩm"]=humidity;
    doc["Nhiệt độ"]=tempurature;

// Khởi tạo mảng ký tự có kích thước 128 để lưu trữ tin nhắn MQTT.
    char mqtt_message[128];

// Chuyển đổi tài liệu JSON thành chuỗi ký tự và lưu vào mảng mqtt_message
    serializeJson(doc,mqtt_message);
    publishMessage("esp8266/dht11", mqtt_message, true);

    timeUpdata=millis();
  }
}
