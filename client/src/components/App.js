import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Header from './Header';
import Dashboard from './Dashboard';
import Landing from './Landing';
import Profile from './Profile';
import Conversation from './Conversation';

//action creators
import { fetchUser } from '../actions/auth';
import { fetchConversation } from '../actions/conversation';
import { setSocketId } from '../actions/socket';

//for socket.io
import io from 'socket.io-client';

const styles = theme => ({
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  componentsContainer: {
  	height: '100%',
  	display: 'flex',
  	flexDirection: 'column'
  }
});

let socket;

class App extends React.Component {

	state={socketSet: false}

	componentDidMount = async () => {
		const user = await this.props.fetchUser();

		await this.props.setSocketId(user.youChatCode);

		if(process.env.NODE_ENV !== 'production'){
			socket = io.connect('http://localhost:5000');
		} else {
			socket = io();
		}

		socket.on('getMessages', res => {
			console.log('getMessages from socket', res);

			this.props.fetchConversation(res);
		});

		socket.on('getConversation', res => {
			console.log('getConversation from socket');

			this.props.fetchUser();
		})

		this.setState({
			socketSet: true
		})
	}

	//this is inplace so that the dashboard and profile only mount if
	//a user is logged in and we have their data is the application state
	displayDashboard = () => {
		const { auth } = this.props;
		if(auth)
			return <Route path="/dashboard" render={props => <Dashboard {...props} />} exact/>;
	}

	displayProfile = () => {
		const { auth } = this.props;
		if(auth)
			return <Route path="/profile" component={Profile} exact />;
	}

	render(){
		const { classes } = this.props;
		return(
			<div className={classes.appContainer}>
				<BrowserRouter>
					<div className={classes.componentsContainer}>
						<Header runningSocket={socket} />
						<Route path="/" component={Landing} exact />
						{this.displayDashboard()}
						{this.displayProfile()}
						<Route 
							path="/conversation/:id" 
							render={props => <Conversation {...props} runningSocket={socket}/>} 
							exact 
						/>
					</div>
				</BrowserRouter>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return state;
}


export default connect(mapStateToProps, { 
	fetchUser, 
	fetchConversation,
	setSocketId
})(withStyles(styles)(App));