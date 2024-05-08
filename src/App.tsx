import { useEffect, useState, useRef } from "react";
import Skeleton from "./Skeleton";

const App = () => {
  type Images = {
    author: string;
    download_url: string;
    height: number;
    id: string;
    url: string;
    width: number;
  };

  const [page, setPage] = useState(0);
  const [imgs, setImgs] = useState<Images[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const API_URL = `https://picsum.photos/v2/list?page=${page}&limit=10`;
  const observer = useRef<any>();

  useEffect(() => {
    setIsLoading(true);
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setImgs((prevImgs) => [...prevImgs, ...data]);
        setImagesLoaded((prevImagesLoaded) =>
          prevImagesLoaded.concat(data.map(() => false))
        );
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [API_URL]);

  useEffect(() => {
    if (isLoading || imgs.length === 0) return;
    observer.current = new IntersectionObserver((entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current.observe(document.querySelector(".end-of-page-marker"));
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, imgs]);

  const handleImageLoad = (index: number) => {
    const img = new Image();
    img.src = imgs[index].download_url;
    img.onload = () => {
      setImagesLoaded((prevImagesLoaded) => {
        const updatedImagesLoaded = [...prevImagesLoaded];
        updatedImagesLoaded[index] = true;
        return updatedImagesLoaded;
      });
    };
  };

  return (
    <>
      <h1>Infinite + Lazy Loading</h1>
      <div className="container">
        {imgs.map((img, index) => (
          <>
            {!imagesLoaded[index] ? (
              <Skeleton key={index} />
            ) : (
              <div key={index} className="imgContainer">
                <img src={img.download_url} alt={`Image ${index}`} />
                <p>Shot By: {img.author}</p>
              </div>
            )}
            {!imagesLoaded[index] && handleImageLoad(index)}
          </>
        ))}
        <div className="end-of-page-marker" style={{ height: "10px" }}></div>
      </div>
      {isLoading && <p className="loading">Loading...</p>}
    </>
  );
};

export default App;