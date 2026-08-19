# simpleChat
overview : imple chat application that does not use a database. Any user who connects to the same room  should be able to send messages, and all connected users should see all the messages in real time
# to start the project cammands are 
clone project ,
npm i -D typescript 
npm i 
npm run dev or tsc -b && node ./dist/index.js

s
#backend things should know 
data to send server :
for room :
{
  "type':"join",
  "payload":{
    "room" : "room_name"
  }
}
# 
for chat in room  :
{
  "type':"chat",
  "payload":{
    "message" : "user message "
  }
}


