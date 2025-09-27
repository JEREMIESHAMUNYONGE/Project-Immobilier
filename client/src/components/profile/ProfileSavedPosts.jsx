import React, { Suspense } from "react";
import { Await, Link } from "react-router-dom";
import Card from "../card/Card";

function ProfileSavedPosts({ postResponsePromise, onPostClick }) {
  return (
    <Suspense fallback={<div className="loading">Chargement...</div>}>
      <Await resolve={postResponsePromise}>
        {(postResponse) => (
          <div className="savedPostsContainer">
            {postResponse.data.savedPosts && postResponse.data.savedPosts.length > 0 ? (
              <div className="list">
                {postResponse.data.savedPosts.map((post) => (
                  <Card key={post.id} item={post} onClick={onPostClick} />
                ))}
              </div>
            ) : (
              <div className="emptyState emptyState--pro">
                <div className="emptyIllustration">
                  <div className="illustrationIcon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H7C6.46957 16 5.96086 15.7893 5.58579 15.4142C5.21071 15.0391 5 14.5304 5 14V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="floatingElements">
                    <div className="floatingDot dot1"></div>
                    <div className="floatingDot dot2"></div>
                    <div className="floatingDot dot3"></div>
                  </div>
                </div>
                <div className="emptyContent">
                  <h2>Aucun favori pour le moment</h2>
                  <p>Commencez à explorer et sauvegardez vos annonces préférées pour les retrouver facilement ici.</p>
                  <Link to="/" className="exploreButton">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Découvrir les annonces
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </Await>
    </Suspense>
  );
}

export default ProfileSavedPosts;
