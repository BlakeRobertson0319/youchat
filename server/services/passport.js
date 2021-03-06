//passport used for oauth
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const keys = require('../config/keys');

const mongoose = require('mongoose');

const User = mongoose.model('users');

const createCode = require('../helpers/createCode');

//define an arrow function and pass it to serializeUser
//1: user model -> the user we got from the database, 2: done function
passport.serializeUser((user, done) => {
	//done is a callback
	//1: error object if it exists, 2: identifying information -> from mongo
	done(null, user.id);
	//used for cookies
});

passport.deserializeUser(async (id, done) => {
	//turn an into mongoose model
	const user = await User.findById(id);

	done(null, user);
});

passport.use(
	new GoogleStrategy({
		clientID: keys.googleClientID,
		clientSecret: keys.googleClientSecret,
		callbackURL: '/auth/google/callback'
	}, 
	//passport callback, runs when google returns a user,
	//when we hit the callbackURL
	async (accessToken, refreshToken, profile, done) => {

		//query of all records in the collection
		//tries to find a record with the same googleId
		const existingUser = await User.findOne({ googleId: profile.id });

		//if the user doesnt exist, create them
		if(existingUser){			

			return done(null, existingUser);
		}

		const code = await createCode(profile.name.givenName, profile.name.familyName).toString();

		console.log('code', code);

		const user = await new User({
			googleId: profile.id,
			fName: profile.name.givenName,
			lName: profile.name.familyName,
			email: profile.emails[0].value,
			youChatCode: code
		}).save();

		done(null, user);
	})
);