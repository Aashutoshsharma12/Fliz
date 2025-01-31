import mongoose, { Schema, model } from "mongoose";
interface rating_reviews {
    userId: any;
    orderId: any;
    companyProviderId:any;
    rating: number;
    review: string;
    ar_review: string;
    isDelete?: boolean;
    isActive?: boolean;
}

const rating_reviewsSchema = new Schema<rating_reviews>(
    {
        userId: { type: mongoose.Types.ObjectId, required: true, ref: 'user_renter_delivery' },
        orderId: { type: mongoose.Types.ObjectId, required: true, ref: 'booking' },
        companyProviderId: { type: mongoose.Types.ObjectId, required: true, ref: 'user_renter_delivery' },
        rating: { type: Number, required: true },
        review: { type: String, required: false },
        ar_review: { type: String, required: false },
        isDelete: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const rating_reviewsModal = model<rating_reviews>("rating_reviews", rating_reviewsSchema);
export = rating_reviewsModal;
