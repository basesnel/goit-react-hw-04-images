import React from 'react';
import PropTypes from 'prop-types';

import { toast } from 'react-toastify';

class Searchbar extends React.Component {
  state = {
    searchQuery: '',
  };

  handleInputChange = event => {
    this.setState({ searchQuery: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();

    if (this.state.searchQuery.trim() === '') {
      toast.error('Empty guery search.', { theme: 'colored' });
      return;
    }

    this.props.qwe(this.state.searchQuery);
    this.setState({ searchQuery: '' });
  };

  render() {
    return (
      <section className="Searchbar">
        <form onSubmit={this.handleSubmit} className="SearchForm">
          <button className="SearchForm-button">
            <span className="SearchForm-button-label">Search</span>
          </button>
          <input
            type="text"
            name="searchQuery"
            autoComplete="off"
            placeholder="Search images..."
            value={this.state.searchQuery}
            onChange={this.handleInputChange}
            className="SearchForm-input"
          />
        </form>
      </section>
    );
  }
}

Searchbar.propTypes = {
  qwe: PropTypes.func.isRequired,
};

export default Searchbar;
