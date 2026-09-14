import { useEffect, useState } from "react";

import NetworkStatus
  from "../components/NetworkStatus";

import {
  getAllSurveys
} from "../services/db";

import {
  syncPendingSurveys
} from "../services/sync";


export default function Dashboard({
  onNewSurvey,
  onViewSurveys
}) {

  const [surveys, setSurveys] =
    useState([]);

  const [syncing, setSyncing] =
    useState(false);

  const [message, setMessage] =
    useState("");


  async function loadData() {

    const data =
      await getAllSurveys();

    setSurveys(data);
  }


  async function handleSync() {

    if (!navigator.onLine) {

      setMessage(
        "🔴 Hiện tại đang Offline"
      );

      return;
    }


    setSyncing(true);

    setMessage(
      "🔄 Đang đồng bộ..."
    );


    try {

      const result =
        await syncPendingSurveys();


      await loadData();


      setMessage(
        `✓ Đồng bộ thành công: ${result.successCount} phiên`
      );

    } catch (error) {

      setMessage(
        "❌ Đồng bộ thất bại"
      );

    } finally {

      setSyncing(false);

    }
  }


  useEffect(() => {

    loadData();

  }, []);


  const synced =
    surveys.filter(
      x => x.syncStatus === "synced"
    ).length;


  const pending =
    surveys.filter(
      x =>
        x.syncStatus === "pending" ||
        x.syncStatus === "error"
    ).length;


  return (
    <div className="page">

      <header className="header">

        <div>
          <h1>
            VKU Field Survey
          </h1>

          <p>
            Khảo sát nhu cầu việc làm sinh viên
          </p>
        </div>

        <NetworkStatus />

      </header>


      <div className="stats">

        <div className="stat-card">
          <strong>
            {surveys.length}
          </strong>

          <span>
            Tổng phiên
          </span>
        </div>


        <div className="stat-card">
          <strong>
            {synced}
          </strong>

          <span>
            Đã đồng bộ
          </span>
        </div>


        <div className="stat-card">
          <strong>
            {pending}
          </strong>

          <span>
            Chờ đồng bộ
          </span>
        </div>

      </div>


      {message && (
        <div className="message">
          {message}
        </div>
      )}


      <div className="dashboard-buttons">

        <button
          className="primary-button"
          onClick={onNewSurvey}
        >
          ＋ Tạo phiên khảo sát
        </button>


        <button
          className="secondary-button"
          onClick={onViewSurveys}
        >
          📋 Danh sách khảo sát
        </button>


        <button
          className="sync-button"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing
            ? "🔄 Đang đồng bộ..."
            : "☁️ Đồng bộ ngay"}
        </button>

      </div>

    </div>
  );
}