import React from "react";
import DOMPurify from "dompurify";

function SingleDescription({ desc }) {
  return (
    <div className="bottom"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }}
    />
  );
}

export default SingleDescription;
