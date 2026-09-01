import {Schema} from 'mongoose';

const hashTagSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const HashTag = model('HashTag', hashTagSchema);