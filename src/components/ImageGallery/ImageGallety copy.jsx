import { nanoid } from 'nanoid';
import { Component } from 'react';

import ImageGalleryItem from 'components/ImageGalleryItem/ImageGalleryItem';
import Loader from 'components/Loader/Loader';
import Button from 'components/Button/Button';
import pixabayAPI from '../../utils/pixabayservice';

class ImageGallery extends Component {
  state = {
    images: null,
    page: 1,
    error: null,
    status: 'idle',
  };

  componentDidUpdate(prevProps, prevState) {
    const prevSearch = prevProps.imageToQuery;
    const nextSearch = this.props.imageToQuery;

    if (prevSearch !== nextSearch) {
      this.setState({ status: 'pending' });

      setTimeout(() => {
        pixabayAPI
          .fetchPixabay(nextSearch, this.state.page)
          .then(data => {
            if (data.total === 0) {
              console.log(data.total);
              this.setState({ status: 'noresult' });
              return Promise.reject(
                new Error(`Sorry, there are no images for: ${nextSearch}`)
              );
            }

            return data.hits;
          })
          .then(images => {
            console.log(images);
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
            this.setState({ images: data, status: 'resolved' });
            this.setState(prevState => {
              return {
                page: prevState.page + 1,
              };
            });
          })
          .catch(error => this.setState({ error, status: 'rejected' }));
      }, 2000);
    }
  }

  render() {
    const { images, error, status } = this.state;
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
          <ul>
            {images.map(({ id, webformatURL, largeImageURL, tags }) => (
              <ImageGalleryItem
                key={id}
                webFormatImage={webformatURL}
                largeImage={largeImageURL}
                tag={tags}
              />
            ))}
          </ul>
          <Button />
        </section>
      );
    }
  }
}

export default ImageGallery;
