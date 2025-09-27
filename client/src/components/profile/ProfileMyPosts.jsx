import React, { Suspense } from "react";
import { Await } from "react-router-dom";
import List from "../list/List";

function ProfileMyPosts({ postResponsePromise, onPostClick }) {
  return (
    <Suspense fallback={<div className="loading">Chargement...</div>}>
      <Await resolve={postResponsePromise}>
        {(postResponse) => (
          <List posts={postResponse.data.userPosts} onPostClick={onPostClick} />
        )}
      </Await>
    </Suspense>
  );
}

export default ProfileMyPosts;
