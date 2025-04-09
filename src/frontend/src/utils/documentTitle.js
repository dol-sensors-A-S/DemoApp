import { useEffect } from "react";

/*
Update the page title when it changes
*/

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title;
  }, [title]); 
};

export default useDocumentTitle;