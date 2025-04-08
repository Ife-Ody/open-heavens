import { useEffect, useRef, useState } from "react";

interface IntersectionObserver extends IntersectionObserverInit {
  keepObserving?: boolean;
}

const useIntersectionObserver = (options: IntersectionObserver) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (options.keepObserving) {
        setIsIntersecting(entry.isIntersecting);
        return;
      }
      if (entry.isIntersecting) {
        setIsIntersecting(entry.isIntersecting);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
