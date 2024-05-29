import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthState } from '../store/authReducer';

interface GuestRouteProps {
  isLoggedIn: boolean;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ isLoggedIn, ...props }) => {
  return isLoggedIn ? <Navigate to="/" /> : <Route {...props} />;
};

const mapStateToProps = (state: { auth: AuthState }) => ({
  isLoggedIn: state.auth.isLoggedIn
});

export default connect(mapStateToProps)(GuestRoute);
