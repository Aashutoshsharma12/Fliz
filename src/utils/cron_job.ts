import cron from 'node-cron';
import moment from "moment-timezone";
import bookingModel from '@models/booking';
import userSessionModel from '@models/userSession';
import user_renter_delivery_Model from '@models/user';
import { unsubscribeFromTopic } from './notification';
import raise_queryModal from '@models/raise_query';
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const jwt = require("jsonwebtoken");

cron.schedule('*/10 * * * * *', async () => {
    try {
        console.log('Every 10 Seconds -----')
        const now = moment();
        const current_timeStamp = now.valueOf();
        /**
         * Cancelled Order After time out
         */
        let bookingStatus = {
            reason: "Auto Cancelled",
            status: "Cancelled",
            actionBy: "Company",
            date: moment().tz(timeZone ? timeZone : "Asia/Calcutta").format("YYYY-MM-DD"),
            time: moment().tz(timeZone ? timeZone : "Asia/Calcutta").format("HH:mm"),
        };
        await bookingModel.updateMany({ bookingStatus: 'Pending', setTimeOut: true, setTimeOut_timeStamp: { $lte: current_timeStamp } }, {
            bookingStatus: "Cancelled",
            $addToSet: { bookingStatus_withReason: bookingStatus },
        });
        /***
         * Auto Resolved Order Query After 24 Hours
         * If user does not reply back to company
         */
        const twentyFourHoursAgo = Math.floor((Date.now() - 60 * 60 * 60 * 1000) / 1000); // Convert to UNIX timestamp in seconds
        const check_orderQuery = await raise_queryModal.aggregate([
            {
                $match: { status: "pending" }
            },
            {
                $lookup: {
                    foreignField: "queryId",
                    localField: "_id",
                    as: "messageDetails",
                    from: "query_chat_messages",
                    pipeline: [
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $limit: 1
                        },
                        {
                            $match: {
                                sendFrom: 'company',
                                timeStamp: { $lte: twentyFourHoursAgo }
                            }
                        },

                    ]

                }
            },
            {
                $match: { 'messageDetails': { $ne: [] } }
            }
        ]);
        if (check_orderQuery.length) {
            check_orderQuery.forEach(async (item: any) => {
                await raise_queryModal.updateOne({ _id: item._id }, { status: "resolve" })
            })
        }
    } catch (err) {
        console.error(err);
    }
});
cron.schedule('*/5 * * * *', async () => {
    /**
     * Delete Expired Refresh Token From DB 
     */
    console.log('Every 5 minutes ------')
    const userSession_List = await userSessionModel.find({ isDelete: false, role: { $ne: "guest_user" } }, { refreshToken: 1, userId: 1, deviceToken: 1 });
    if (userSession_List.length) {
        userSession_List.forEach(async (data: any) => {
            try {
                const verified_jwtToken = await jwt.verify(data.refreshToken, process.env.JWT_SECRET_TOKEN)
            } catch (err) {
                if (err.message == "jwt expired") {
                    await userSessionModel.deleteOne({ _id: data._id });
                    const check_active_token = await userSessionModel.findOne({ userId: data.userId, isDelete: false });
                    if (!check_active_token) {
                        await user_renter_delivery_Model.updateOne({ _id: data.userId }, { online: false })
                    }
                    const check_deviceToken = await userSessionModel.findOne({ deviceToken: data.deviceToken });
                    if (check_deviceToken) {
                        // unsubscribeFromTopic()
                    }

                }
            }
        })
    }
});
// let ar:any = [34,23,34,12,31]
// let arr:any = [... new Set(ar) ]
// arr.sort((a:any,b:any)=>b-a)
// console.log(arr,"djdjdjdjdjd",arr[1])
// let original_array = [1, 3, 4, 5, 6, 78, 8, 8, 8, 8, 7, 7, 7];
// let ori_ar:any = []
// let ori_ar1:any = []
// let element_count: any = {}
// let duplicate_array: any = []
// original_array.map((item) => {
//     if (element_count[item]) {
//         element_count[item]++
//     } else {
//         element_count[item] = 1
//     }
//     if (element_count[item] === 1) {
//         duplicate_array.push(item)
//     }
// });

// for (let item1 in element_count) {
//     let count = element_count[item1];
//     if (count === 1) {
//         ori_ar.push(Number(item1))
//     }
//     if (count === 3) {
//         ori_ar1.push(Number(item1))
//     }
// }
// console.log(ori_ar1,"ori_ar1",duplicate_array, "element_count", element_count, "occurrence_array", ori_ar)

// A closure allows the inner function to access variables from its outer function even after the outer function has finished executing.
// Closures are often used in JavaScript for data encapsulation, callbacks, and event handling.
//Closer/closure function
// function outer(data:any){
//     return function inner(data1:any){
//         console.log(data+" "+ data1 )
//     }
// }
// const da =outer("Hi")
// da('Aashu')
//Closer/closure function
// function outer() {
//     const data = "Hi"
//     function inner1(data1: any) {
//         // console.log(data+" "+ data1 )
//         return data + " " + data1
//     }
//     function inner2(data1: any) {
//         // console.log(data+" Mr "+ data1 )
//         return data + " Mr " + data1
//     }
//     return {
//         inner1,
//         inner2
//     }
// }
// const da = outer()
// const inner1 = da.inner1('Aashu')
// const inner2 = da.inner2('Aashu')
// console.log( inner1, "inner1", inner2)
// let rowCount = 5;  // The number of rows you want to print

// *
// **
// ***
// ****
// *****
// let row: any =''
// for (let i = 0; i < 5; i++) {
//     row += '*';
//     console.log(row)
// }
// for(let i = 1;i<=rowCount;i++){
//     let spaces = ' '.repeat(rowCount  - i);
//     let stars = '*'.repeat(i);
//     console.log(stars+spaces);
// }

// *****
//  ****
//   ***
//    **
//     *
// for (let i = rowCount; i >= 1; i--) {
//     let spaces = ' '.repeat(rowCount - i);
//     let stars = '*'.repeat(i);
//     console.log(spaces + stars);
// }


//     *
//    **
//   ***
//  ****
// *****
// for (let i = 1; i <= rowCount; i++) {
//     let spaces = ' '.repeat(rowCount - i);  // Generate spaces for the current row
//     let stars = '*'.repeat(i);  // Generate stars for the current row
//     console.log(spaces + stars);  // Concatenate spaces and stars and log them
// }

// *****
// **** 
// ***  
// **   
// *    
// for (let i = 0; i <= rowCount; i++) {
//     let stars = '*'.repeat(rowCount - i);  // Generate spaces for the current row
//     let spaces = ' '.repeat(i);  // Generate stars for the current row
//     console.log(stars + spaces);  // Concatenate spaces and stars and log them
// }

//     *
//    ***
//   *****
//  *******
// *********
//   for(let i = 1;i<= rowCount;i++){
//     let spaces = ' '.repeat(rowCount-i)
//     let stars = '*'.repeat(2*i-1)
//     console.log(spaces + stars);  // Concatenate spaces and stars and log them
//   }

// *********
//  *******
//   *****
//    ***
//     *
// for(let i = rowCount;i>=1;i--){
//     let spaces = ' '.repeat(rowCount - i)
//     let stars = '*'.repeat(2*i-1)
//     console.log(spaces + stars);  // Concatenate spaces and stars and log them
//   }


// function addSpaces(s:any, spaces:any) {
//     let result = '';
//     let lastIndex = 0;
//     // spaces.sort((a, b) => a - b);
//     // Loop through each index where a space needs to be added
//     for (let i = 0; i < spaces.length; i++) {
//         result += s.slice(lastIndex, spaces[i]) + ' ';
//         lastIndex = spaces[i];
//     }
//     result += s.slice(lastIndex);
//     return result;
// }

// const s = "LeetcodeHelpsMeLearn";
// const spaces = [8, 13, 15];
// console.log(addSpaces(s, spaces));  // Output: "Leetcode Helps Me Learn"
