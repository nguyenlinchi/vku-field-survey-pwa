import { useEffect, useState } from "react";

import {
  getAllSurveys
} from "../services/db";


export default function SurveyList({
  onBack
}) {

  const [surveys, setSurveys] =
    useState([]);


  async function loadSurveys() {

    const data =
      await getAllSurveys();

    setSurveys(data);

  }


  useEffect(() => {

    loadSurveys();

  }, []);


  function getStatus(survey) {

    if (
      survey.syncStatus === "synced"
    ) {
      return (
        <span className="status synced">
          🟢 Đã đồng bộ
        </span>
      );
    }


    if (
      survey.syncStatus === "syncing"
    ) {
      return (
        <span className="status syncing">
          🔄 Đang đồng bộ
        </span>
      );
    }


    if (
      survey.syncStatus === "error"
    ) {
      return (
        <span className="status error">
          🔴 Lỗi đồng bộ
        </span>
      );
    }


    return (
      <span className="status pending">
        🟡 Chờ đồng bộ
      </span>
    );
  }


  return (

    <div className="page">

      <div className="page-title">

        <button
          className="back-button"
          onClick={onBack}
        >
          ←
        </button>

        <div>
          <h1>
            Danh sách khảo sát
          </h1>

          <p>
            {surveys.length} phiên
          </p>
        </div>

      </div>


      {surveys.length === 0 ? (

        <div className="empty">
          Chưa có phiên khảo sát.
        </div>

      ) : (

        <div className="survey-list">

          {surveys.map(survey => (

            <div
              className="survey-card"
              key={survey.sessionId}
            >

              <div className="survey-card-header">

                <strong>
                  {survey.sessionId}
                </strong>

                {getStatus(survey)}

              </div>


              <p>
                👤 {survey.studentName}
              </p>


              <p>
                🎓 {survey.faculty}
              </p>


              <p>
                📅{" "}
                {new Date(
                  survey.createdAt
                ).toLocaleString(
                  "vi-VN"
                )}
              </p>


              <p>
                📍{" "}
                {survey.latitude?.toFixed(6)}
                ,
                {" "}
                {survey.longitude?.toFixed(6)}
              </p>


              {survey.syncError && (

                <small className="error-text">
                  {survey.syncError}
                </small>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}