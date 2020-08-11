import React from 'react';
import Outer from '../../Templates/Outer';
import { 
  Login,
  LoginFullstack, 
} from '../../pageListAsync';

class LoginDedicated extends React.Component {
  render() {
    return (
      <Outer>
        <LoginFullstack />
      </Outer>
    );
  }
}

export default LoginDedicated;
