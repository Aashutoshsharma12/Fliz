import { Schema, model } from "mongoose";



interface faq {

  que: string;
  ar_que: string;
  lower_que: string;
  ar_lower_que: string;
  ans: string;
  ar_ans: string;
  lower_ans: string;
  ar_lower_ans: string;
  isActive: boolean;
  isDelete: boolean;
}

const faqSchema = new Schema<faq>(
  {
    // uniqueId: { type: String },
    que: { type: String},
    lower_que: { type: String },
    ar_que: { type: String },
    ar_lower_que: { type: String },
    ans: { type: String},
    lower_ans: { type: String },
    ar_ans: { type: String},
    ar_lower_ans: { type: String },
    isActive: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

faqSchema.index({ lower_que: 1, ar_lower_que: 1, lower_ans:1, ar_lower_ans:1, isDelete: 1 });
const faqModel = model<faq>("faq", faqSchema);
export = faqModel;
