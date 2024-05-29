import React, { useEffect }  from 'react';
import './App.css';
import Page from './page/Page';
import SOCKET_ONCE from './SocketCustom';

import { connect } from 'react-redux';


interface AppState
{
    
}

interface AppProps
{

}

class App extends React.Component<AppProps, AppState>
{
  constructor(props: any)
  {
    super(props)

    // -- SOCKET_ONCE
    SOCKET_ONCE.onDisconnect = () => {

    }
  }

  componentDidMount() 
  {

  }

  render()
  {
    return (
      <div id="app">
        <Page />
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({

});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(App);



// function App() {
//   return (
//     <div id="app">
//       <Page />
//     </div>
//   );
// }

// export default App;
