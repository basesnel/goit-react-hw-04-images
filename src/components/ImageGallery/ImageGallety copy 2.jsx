import { nanoid } from 'nanoid';
import { Component } from 'react';

import ImageGalleryItem from 'components/ImageGalleryItem/ImageGalleryItem';
import Loader from 'components/Loader/Loader';
import Button from 'components/Button/Button';
import Modal from 'components/Modal/Modal';

import pixabayAPI from '../../utils/pixabayservice';

class ImageGallery extends Component {
  state = {
    images: [],
    page: 1,
    error: null,
    status: 'idle',
    pending: false,
    isShowModal: false,
  };

  imageToModal = '';
  tagToModal = '';

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  escFunction = event => {
    if (event.key === 'Escape') {
      this.state.isShowModal && this.setState({ isShowModal: false });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const prevSearch = prevProps.imageToQuery;
    const nextSearch = this.props.imageToQuery;
    const prevPage = prevState.page;
    const currentPage = this.state.page;
    const perPage = 12;

    // console.log(prevPage, currentPage);

    if (prevSearch !== nextSearch || prevPage !== currentPage) {
      this.setState({ pending: true });

      if (prevSearch !== nextSearch) {
        this.setState({ images: [], page: 1 });
      }

      if (currentPage === 1) {
        this.setState({ status: 'pending' });
      }

      setTimeout(() => {
        pixabayAPI
          .fetchPixabay(nextSearch, currentPage, perPage)
          .then(data => {
            if (data.total === 0) {
              this.setState({ status: 'noresult' });
              return Promise.reject(
                new Error(`Sorry, there are no images for: ${nextSearch}`)
              );
            }

            return data.hits;
          })
          .then(images => {
            const imagesCollection = images.map(
              ({ webformatURL, largeImageURL, tags }) => {
                const item = {};

                item.id = nanoid();
                item.webformatURL = webformatURL;
                item.largeImageURL = largeImageURL;
                item.tags = tags;

                return item;
              }
              // `<li><a href="${largeImageURL}"><img src="${webformatURL}"></a></li>`
            );
            return imagesCollection;
          })
          .then(data => {
            this.setState(prevState => {
              return {
                images: [...prevState.images, ...data],
              };
            });
            this.setState({ status: 'resolved' });
          })
          .catch(error => this.setState({ error, status: 'rejected' }))
          .finally(this.setState({ pending: false }));
      }, 2000);
    }
  }

  showModal = index => {
    this.imageToModal = this.state.images[index].largeImageURL;
    this.tagToModal = this.state.images[index].tags;

    this.setState({ isShowModal: true });
  };

  hideModal = event => {
    if (event.target === event.currentTarget) {
      this.setState({ isShowModal: false });
    }
  };

  onLoadMoreImages = () => {
    this.setState(prevState => {
      return {
        page: prevState.page + 1,
      };
    });
  };

  render() {
    const { images, error, status, pending, isShowModal } = this.state;
    const { imageToQuery } = this.props;

    if (status === 'idle') {
      return <p>Please enter query to search images</p>;
    }

    if (status === 'pending') {
      return <Loader searchQuery={imageToQuery} />;
    }

    if (status === 'rejected') {
      return <p>{error.message}</p>;
    }

    if (status === 'noresult') {
      return <p>{error.message} </p>;
    }

    if (status === 'resolved') {
      return (
        <section>
          <ul className="ImageGallery">
            {images.map(({ id, webformatURL, largeImageURL, tags }, index) => (
              <ImageGalleryItem
                key={id}
                id={id}
                webFormatImage={webformatURL}
                largeImage={largeImageURL}
                tag={tags}
                onShowModal={() => this.showModal(index)}
              />
            ))}
          </ul>
          <section className="ImageGallery-footer">
            {pending ? (
              <Loader searchQuery={imageToQuery} />
            ) : (
              <Button onClick={this.onLoadMoreImages} />
            )}
          </section>

          {isShowModal && (
            <Modal
              imageModal={this.imageToModal}
              tagModal={this.tagToModal}
              onHide={this.hideModal}
            />
          )}
        </section>
      );
    }
  }
}

export default ImageGallery;
