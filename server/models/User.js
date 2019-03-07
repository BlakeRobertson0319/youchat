const mongoose = require('mongoose');
const { Schema } = mongoose;

const shortid = require('shortid');

//need youChatCode



//user model
const userSchema = new Schema({
	googleId: String,
	youChatCode: {
		type: String,
		default: shortid.generate
	},
	fName: String,
	lName: String,
	conversations: [String]
	
});

//tells mongoose the new collection needs to be created
//first argument is the name of the collection, second is the schema
mongoose.model('users', userSchema)