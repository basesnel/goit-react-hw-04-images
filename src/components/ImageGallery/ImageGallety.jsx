import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { Component } from 'react';
// import { toast } from 'react-toastify';

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
    allSearchRes: false,
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
    let currentPage = this.state.page;
    const perPage = 12;

    let totalHits = 0;

    if (prevSearch !== nextSearch || prevPage !== currentPage) {
      this.setState({ pending: true });

      this.setState({ allSearchRes: false });

      if (prevSearch !== nextSearch) {
        this.setState({ images: [], page: 1 });
        currentPage = 1;
      }

      console.log(
        `this.state.page=${this.state.page}, currentPage=${currentPage}, prevPage=${prevPage}`
      );

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

            totalHits = data.totalHits;

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
            if (currentPage === 1) {
              this.setState({ images: [...data], status: 'resolved' });
            } else {
              this.setState(prevState => {
                return {
                  images: [...prevState.images, ...data],
                  status: 'resolved',
                };
              });
            }
            // this.setState({ status: 'resolved' });

            // console.log(totalHits, this.state.images.length + data.length);
            if (totalHits === this.state.images.length + data.length) {
              // console.log('These are all search results');
              this.setState({ allSearchRes: true });
            }

            // const { height: galleryBottom } = document
            //   .querySelector('.ImageGallery')
            //   .getBoundingClientRect();

            // window.scrollBy({
            //   top: galleryBottom - window.pageYOffset,
            //   behavior: 'smooth',
            // });
          })
          .catch(error => this.setState({ error, status: 'rejected' }))
          .finally(this.setState({ pending: false }));
      }, 500);
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
    const { images, error, status, pending, allSearchRes, isShowModal } =
      this.state;
    const { imageToQuery } = this.props;

    if (status === 'idle') {
      return (
        <section className="Invitation">
          <p>Please enter query to search images</p>
        </section>
      );
    }

    if (status === 'pending') {
      return <Loader searchQuery={imageToQuery} />;
    }

    if (status === 'rejected') {
      // toast.error(error.message, {
      //   theme: 'colored',
      //   toastId: 'badRequest',
      // });
      return (
        <section className="Warning">
          <p>{error.message}</p>
        </section>
      );
    }

    if (status === 'noresult') {
      // toast.warning(error.message, {
      //   theme: 'colored',
      //   toastId: 'noResult',
      // });
      return (
        <section className="Info">
          <p>{error.message}</p>;
        </section>
      );
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
                tag={tags}
                onShowModal={() => this.showModal(index)}
              />
            ))}
          </ul>
          <section className="ImageGallery-footer">
            {allSearchRes ? (
              <p>These are all search results.</p>
            ) : pending ? (
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

ImageGallery.propTypes = {
  imageToQuery: PropTypes.string.isRequired,
};

export default ImageGallery;
