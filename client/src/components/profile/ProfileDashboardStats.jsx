import React from "react";

function ProfileDashboardStats({ myPostsCount, savedCount, chatsCount, notifNumber }) {
  return (
    <>
      <div className="statsGrid">
        <div className="statCard">
          <div className="statIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{myPostsCount}</div>
            <div className="statLabel">Mes Annonces</div>
            <div className="statChange positive">&nbsp;</div>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{chatsCount}</div>
            <div className="statLabel">Conversations</div>
            <div className="statChange positive">&nbsp;</div>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{notifNumber}</div>
            <div className="statLabel">Messages non lus</div>
            <div className="statChange positive">&nbsp;</div>
          </div>
        </div>

        <div className="statCard">
          <div className="statIcon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 14C19 14.5304 18.7893 15.0391 18.4142 15.4142C18.0391 15.7893 17.5304 16 17 16H7C6.46957 16 5.96086 15.7893 5.58579 15.4142C5.21071 15.0391 5 14.5304 5 14V6C5 5.46957 5.21071 4.96086 5.58579 4.58579C5.96086 4.21071 6.46957 4 7 4H17C17.5304 4 18.0391 4.21071 18.4142 4.58579C18.7893 4.96086 19 5.46957 19 6V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="statContent">
            <div className="statNumber">{savedCount}</div>
            <div className="statLabel">Annonces Sauvées</div>
            <div className="statChange positive">&nbsp;</div>
          </div>
        </div>
      </div>

      <div className="recentActivity">
        <h3>Activité récente</h3>
        <div className="activityList">
          <div className="activityItem">
            <div className="activityIcon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="activityContent">
              <div className="activityText">Nouvelle annonce créée</div>
              <div className="activityTime">Il y a 2 heures</div>
            </div>
          </div>
          <div className="activityItem">
            <div className="activityIcon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="activityContent">
              <div className="activityText">Nouveau message reçu</div>
              <div className="activityTime">Il y a 4 heures</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileDashboardStats;
