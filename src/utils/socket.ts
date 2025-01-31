import chat_messageModal from "@models/chat_message";
import chat_roomModal from "@models/chat_room";
import query_chat_messageModal from "@models/query_chat_message";
import moment from "moment-timezone";

const { io } = require('../index');
const nsp = io.of(`/api/${process.env.channelName}`)

/*** 
 * Send Message Hash
 */
// {
//     "companyProviderId": "",
//     "userId": "",
//     "orderId": "",
//     "roomId":""  // OrderId
//     "message": "",
//     "messageType": "text",   // text,imageUrl,videoUrl,voiceUrl, docUrl
//     "sendFrom": "company", // user,company
//     "sendTo": "user", // user company
//     "currentTimezone": "Asia/Cacutta"
// }

/*** 
 * Send Set-Timer Hash
 */
// {
//     type: "setTimer",
//         setTimeOut_timeStamp: 899898,
//             roomId: ""  // OrderId
// }

// {
//     "companyProviderId": "",
//     "userId": "",
//     "orderId": "",
//     "roomId":"",
//     "message": "",
//     "messageType": "text",
//     "sendFrom": "company", // user,company
//     "sendTo": "user", // user company
//     "currentTimezone": "Asia/Cacutta"
// }

/**
 * Room Join Hash
 */
// {
//     roomId: '',  // OrderId
//         roomType: "chat",
//             room_creater: "company", // user, company
//     }

/**
 * Room Join Hash For Query Chat
 */
// {
//     roomId: '',  // queryId
//         roomType: "query",
//             room_creater: "company", // user, company
//     }

/*** 
 * Send Message Hash For Query Chat
 */
// {
//     "companyProviderId": "",
//     "userId": "",
//     "orderId": "",
//     "queryId": "",
//     "message": "",
//     "messageType": "text",
//     "sendFrom": "company", // user,company
//     "sendTo": "user", // user company
//     "currentTimezone": "Asia/Cacutta"
// }

/**
 * 
 * @param data 
 * 
 * Save roomId into database
 */

const save_roomId = async (data: any) => {
    const checkRoomId = await chat_roomModal.findOneAndUpdate({ roomId: data.roomId }, data);
    if (!checkRoomId) {
        await chat_roomModal.create(data);
    }
}

/**
 * 
 * @param data 
 * Save message details into database
 */
const save_chat_messages = async (data: any) => {
    await chat_messageModal.create(data);
}
const save_query_chat_messages = async (data: any) => {
    await query_chat_messageModal.create(data);
}

export = async (eventEmitter: any) => {
    nsp.on('connection', (socket: any) => {
        console.log("Connecting -------------")
        socket.on('join_room', (data: any) => {
            save_roomId(data);
            socket.join(data.roomId);
            console.log("Join room -------------", data.roomId)
        });
        /** 
         * User and Company chat behalf on order information
         */
        // Leave a room
        socket.on('leaveRoom', async (data: any) => {
            socket.leave(data.roomId); // Leave the room
            console.log(`Socket ${socket.id} left room ${data.roomId}`);
        });
        socket.on('send_chat_messages', async (data: any) => {
            try {
                let messageObj: any = data
                if (data.type && data.type == "setTimer") {
                    messageObj = {
                        ...messageObj,
                        type: 'setTimer',
                        setTimeOut: true,
                        setTimeOut_timeStamp: data.setTimeOut_timeStamp
                    }
                } else {
                    messageObj = {
                        ...messageObj,
                        ...data,
                        type: 'messages',
                        date: moment(new Date()).tz(data.currentTimezone ? data.currentTimezone : 'Asia/Calcutta').format('YYYY-MM-DD'),
                        time: moment().tz(data.currentTimezone ? data.currentTimezone : 'Asia/Calcutta').format("HH:mm"),
                        timeStamp: moment.utc().unix()
                    };
                    let save_data = save_chat_messages(messageObj)
                }
                console.log("listening-----", data.roomId)
                socket.broadcast.to(data.roomId).emit('receive_chat_messages', messageObj);
            } catch (err) {
                console.error('Error saving message:', err);
                socket.emit('error_saving_message', err.message); // Notify client of error          
            }
        });

        /***
         * User and company chat behalf on order query
         */
        socket.on('send_query_chat_messages', async (data: any) => {
            try {
                let messageObj: any = data
                messageObj = {
                    ...messageObj,
                    ...data,
                    date: moment(new Date()).tz(data.currentTimezone ? data.currentTimezone : 'Asia/Calcutta').format('YYYY-MM-DD'),
                    time: moment().tz(data.currentTimezone ? data.currentTimezone : 'Asia/Calcutta').format("HH:mm"),
                    timeStamp: moment.utc().unix()
                };
                await save_query_chat_messages(messageObj)
                console.log("query_chat_message_listening-----", data.roomId)
                socket.broadcast.to(data.roomId).emit('receive_query_chat_messages', messageObj);
            } catch (err) {
                console.error('Error saving message:', err);
                socket.emit('error_saving_message', err.message); // Notify client of error          
            }
        });
        socket.on("disconnect", function (data: any) {
            console.log('disconnect', data);
            socket.broadcast.to(data.roomId).emit('disconnected', {
                roomId: data.roomId
            });
        });

        socket.on('typing', function (data: any) {
            socket.broadcast.to(data.roomId).emit('user_typing', {
                message: 'typing.......',
            });
        });
    });
};