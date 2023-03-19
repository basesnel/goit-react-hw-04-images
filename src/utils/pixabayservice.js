function fetchPixabay(searchQuery, page, perPage) {
  return fetch(
    `https://pixabay.com/api/?q=${searchQuery}&page=${page}&key=33045581-3a3af9a2074d1c4024adb3324&image_type=photo&orientation=horizontal&per_page=${perPage}`
  ).then(res => {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(
      new Error(`Sorry, bad request from this query: ${searchQuery}`)
    );
  });
}

const api = { fetchPixabay };

export default api;
