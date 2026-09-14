import {
  getPendingSurveys,
  updateSurvey
} from "./db";


// DÁN URL GOOGLE APPS SCRIPT VÀO ĐÂY
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxVhR9FhQZqHrtfDRyJ-6AGeEynb4Oo97BQKsPVL7zMcK7euM9Dn7g78gJCjFY9sert/exec";


export async function sendSurvey(
  survey
) {

  const response =
    await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify({
          ...survey,

          photo: ""
        })
      }
    );


  if (!response.ok) {
    throw new Error(
      "Upload failed"
    );
  }


  const result =
    await response.json();


  if (!result.success) {
    throw new Error(
      result.message ||
      "Google Sheet error"
    );
  }


  return result;
}


// Đồng bộ tất cả dữ liệu pending
export async function syncPendingSurveys() {

  if (!navigator.onLine) {
    return {
      success: false,
      message: "Offline"
    };
  }


  const pending =
    await getPendingSurveys();


  let successCount = 0;
  let failedCount = 0;


  for (const survey of pending) {

    try {

      await updateSurvey(
        survey.sessionId,
        {
          syncStatus: "syncing"
        }
      );


      await sendSurvey(survey);


      await updateSurvey(
        survey.sessionId,
        {
          syncStatus: "synced",
          syncedAt:
            new Date().toISOString(),
          syncError: null
        }
      );


      successCount++;

    } catch (error) {

      await updateSurvey(
        survey.sessionId,
        {
          syncStatus: "error",
          syncError:
            error.message
        }
      );


      failedCount++;
    }
  }


  return {
    success: true,
    successCount,
    failedCount
  };
}