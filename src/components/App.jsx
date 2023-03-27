import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';

import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallety';
import Button from './Button/Button';

import pixabayAPI from '../utils/pixabayservice';
import Loader from './Loader/Loader';

export default function App() {
  const [imageToSearch, setImageToSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState([]);
  const [idle, setIdle] = useState(true);
  const [pending, setPending] = useState(false);
  const [allSearchRes, setAllSearchRes] = useState(false);
  // const [status, setStatus] = useState('idle');

  const handleSearchSubmit = imageToSearch => {
    setImageToSearch(imageToSearch);
    setCurrentPage(1);
    setImages([]);
    setIdle(false);
  };

  const perPage = 12;

  useEffect(() => {
    if (!imageToSearch) return;

    let totalHits;

    setAllSearchRes(false);
    setPending(true);
    // setStatus('pending')

    setTimeout(() => {
      pixabayAPI
        .fetchPixabay(imageToSearch, currentPage, perPage)
        .then(data => {
          totalHits = data.totalHits;
          if (data.total === 0) {
            setIdle(true);
            return Promise.reject(
              new Error(`Sorry, there are no images for: ${imageToSearch}`)
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
          );
          return imagesCollection;
        })
        .then(data => {
          setImages(prevData => [...prevData, ...data]);
          console.log(currentPage);
          if ((currentPage - 1) * perPage + data.length === totalHits) {
            setAllSearchRes(true);
            toast.info('These are all search results.', {
              theme: 'colored',
              toastId: 'endSearch',
            });
          }
        })
        .catch(error => {
          setIdle(true);
          toast.error(error.message, {
            theme: 'colored',
            toastId: 'badRequest',
          });
        })
        .finally(setPending(false));
    }, 500);
  }, [currentPage, imageToSearch]);

  const onLoadMoreImages = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="App">
      <Searchbar qwe={handleSearchSubmit} />

      <ImageGallery imagesList={images} />

      {idle ? (
        <section className="Invitation">
          <p>Please enter query to search images</p>
        </section>
      ) : pending ? (
        <Loader searchQuery={imageToSearch} />
      ) : allSearchRes ? (
        <section className="Info">
          <p>These are all search results.</p>
        </section>
      ) : (
        <Button onClick={onLoadMoreImages} />
      )}

      {/* {!allSearchRes ? (
        pending ? (
          <Loader searchQuery={imageToSearch} />
        ) : idle ? (
          <section className="Invitation">
            <p>Please enter query to search images</p>
          </section>
        ) : (
          <Button onClick={onLoadMoreImages} />
        )
      ) : (
        <section className="Info">
          <p>These are all search results.</p>
        </section>
      )} */}

      {/* {(() => {
        switch (status) {
          case 'idle':
            return (
              <section className="Invitation">
                <p>Please enter query to search images</p>
              </section>
            );
          case 'pending':
            return <Loader searchQuery={imageToSearch} />;
          case 'loadmore':
            return <Button onClick={onLoadMoreImages} />;
          case 'info':
            return (
              <section className="Info">
                <p>These are all search results.</p>
              </section>
            );
          default:
            return null;
        }
      })()} */}

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
