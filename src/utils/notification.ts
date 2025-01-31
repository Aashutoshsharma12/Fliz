import { messages } from "@Custom_message";
import user_renter_delivery_Model from "@models/user";
import userSessionModel from "@models/userSession";
import * as admin from "firebase-admin";
import * as path from "path";
import { json } from "stream/consumers";

// Path to your service account JSON file
const serviceAccountPath = path.resolve(__dirname, "../../fliz-dcec0-firebase-adminsdk-fbsvc-00c19095dc.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
});


async function subscribeToTopic(devideToken: any, topics: any) {
    try {
        topics.forEach(async (topic: any) => {
            console.log(topic)
            const response = await admin.messaging().subscribeToTopic(devideToken, topic);
            console.log("Successfully subscribed:", response);
        })
    } catch (error) {
        console.error("Error subscribing to topic:", error);
    }
}

// Function to unsubscribe from a topic
async function unsubscribeFromTopic(deviceToken: any, topic: any) {
    try {
        const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
        console.log(`Successfully unsubscribed from topic "${topic}":`, response);
    } catch (error) {
        console.error(`Error unsubscribing from topic "${topic}":`, error);
    }
}

async function sendNotificationToTopic(topic: string, messageObj: any) {
    const message = {
        notification: {
            title: messageObj.title,
            body: messageObj.body,
        },
        topic: topic, // Subscribe Topic
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Function to send notification
async function sendNotificationToSpecificDevice(notificationObj: any) {
    try {
        const { userId, bookingStatus, orderId, language, role } = notificationObj
        const custom_message = messages(language)
        let message: any = {}
        const check_userNotification_status: any = await user_renter_delivery_Model.findById(userId, { isNotification: 1, name: 1 });
        if (check_userNotification_status?.isNotification) {
            if (role == 'user') {
                message = {
                    ...message,
                    notification: {
                        title: custom_message.notification_title,
                        body: custom_message.notification_description.replace('{{userName}}', check_userNotification_status.name).replace('{{orderId}}', orderId).replace('{{bookingStatus}}', bookingStatus),
                    },
                    // token: notificationObj, // FCM device token
                };
            } else if (role == 'admin') {
                message = {
                    ...message,
                    notification: {
                        title: notificationObj.title,
                        body: notificationObj.description,
                    },
                }
            }
            else {
                message = {
                    ...message,
                    notification: {
                        title: custom_message.notification_title,
                        body: custom_message.notification_description.replace('{{companyName}}', check_userNotification_status.name).replace('{{orderId}}', orderId).replace('{{bookingStatus}}', bookingStatus),
                    },
                    // token: notificationObj, // FCM device token
                };
            }
            const deviceToken_list = await userSessionModel.find({ userId: userId });
            if (deviceToken_list.length) {
                deviceToken_list.forEach(async (item: any) => {
                    message.token = item.deviceToken
                    const response = await admin.messaging().send(message);
                    console.log('Notification sent successfully:', response);
                })
            }
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

export {
    subscribeToTopic,
    sendNotificationToTopic,
    sendNotificationToSpecificDevice,
    unsubscribeFromTopic
};