import {Schema, model} from 'mongoose';


let TransactionSchema = new Schema(
    {
        nonce: {
            type: Number,
            default: 0,
            unique: false,
            required: true
        },
        hash: {
            type: String
        },
        status: {
            type: String,
            default: "Unconfirmed" // Also can be "Confirmed", "Rejected"
        },
        raw_tx: {
            type: Object
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
        new_tx_hash: {
            type: String
        }
    }
);

module.exports = model('TransactionSchema', TransactionSchema);
