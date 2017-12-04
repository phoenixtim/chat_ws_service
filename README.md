## Run project

1. copy config.template.json to config.json
1. write your parameters in config.json
1. make `npm install --production --no-save`
1. make `source .env` in terminal from project directory
1. make `npm start`

## Connection

Address: `ws://localhost:{port_from_config}/socket.io/?EIO=3&transport=websocket`

## API

### Messages

All responses contains "status" field and optional "data" and "error".

#### Client

For each message from client service provides response message with name `{client_message_name}-response`.

* `room-create` - request: `{"roomName": "{some_name}"}`
* `room-name-change` - request: `{"roomId": "{room_id}", "roomName": "{new_name}"}`
* `room-join` - request: `{"roomId": "{room_id}"}`
* `room-leave` - request: `{"roomId": "{room_id}"}`
* `room-users` - request: `{"roomId": "{room_id}"}`
* `room-list` - request: `{"limit": {number_from_0_to_50}, "offset": {number_from_0}, "name": "{any_part_of_room_name}"}`
* `message-send` - request: `{"to": "{room_id}", "message": "{your_text}"}`

#### Server

* `room-name-new`
* `user-connected`
* `user-disconnected`
* `message`
