import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallety';

class App extends React.Component {
  state = {
    imageToSearch: '',
  };

  handleSearchSubmit = imageToSearch => {
    this.setState({ imageToSearch });
  };

  render() {
    return (
      <div className="App">
        <Searchbar qwe={this.handleSearchSubmit} />

        <ImageGallery imageToQuery={this.state.imageToSearch} />

        {/* <ToastContainer autoClose="3000" /> */}
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={1}
        />
      </div>
    );
  }
}

export default App;
