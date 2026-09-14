import { useState } from "react";

import {
  compressImage
} from "../services/image";
import {
  addSurvey
} from "../services/db";

import {
  getCurrentLocation
} from "../services/location";

import {
  sendSurvey
} from "../services/sync";


function generateSessionId() {

  const date =
    new Date();

  const timestamp =
    date
      .toISOString()
      .replace(/\D/g, "")
      .slice(0, 14);


  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();


  return `VKU-${timestamp}-${random}`;
}


export default function NewSurvey({
  onBack
}) {

  const [interviewer, setInterviewer] =
    useState("");

  const [studentName, setStudentName] =
    useState("");

  const [studentId, setStudentId] =
    useState("");

  const [faculty, setFaculty] =
    useState("");

  const [year, setYear] =
    useState("");


  const [q1, setQ1] =
    useState("");

  const [q2, setQ2] =
    useState("");

  const [q3, setQ3] =
    useState([]);

  const [q4, setQ4] =
    useState([]);

  const [q5, setQ5] =
    useState("");

  const [q6, setQ6] =
    useState([]);

  const [q7, setQ7] =
    useState([]);

  const [q8, setQ8] =
    useState("");


  const [location, setLocation] =
    useState(null);

  const [photo, setPhoto] =
    useState(null);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  async function handleLocation() {

    setLoadingLocation(true);

    setMessage(
      "📍 Đang lấy vị trí..."
    );


    try {

      const position =
        await getCurrentLocation();


      setLocation(position);

      setMessage(
        "✓ Đã lấy vị trí"
      );

    } catch (error) {

      setMessage(
        "❌ Không thể lấy vị trí. Hãy cấp quyền GPS."
      );

    } finally {

      setLoadingLocation(false);

    }
  }


  function handleMultiSelect(
    value,
    current,
    setter
  ) {

    if (current.includes(value)) {

      setter(
        current.filter(
          item => item !== value
        )
      );

    } else {

      setter([
        ...current,
        value
      ]);

    }
  }


  async function handlePhoto(event) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  try {

    setMessage(
      "📷 Đang xử lý ảnh..."
    );


    const compressed =
      await compressImage(
        file,
        1280,
        1280,
        0.7
      );


    console.log(
      "Original:",
      Math.round(
        file.size / 1024
      ),
      "KB"
    );


    console.log(
      "Compressed:",
      Math.round(
        compressed.size / 1024
      ),
      "KB"
    );


    setPhoto(
      compressed
    );


    setMessage(
      "✓ Đã chụp và lưu ảnh"
    );


  } catch (error) {

    console.error(error);


    setMessage(
      "❌ Không thể xử lý ảnh"
    );

  }

}


  async function handleSubmit(event) {

    event.preventDefault();


    if (!interviewer.trim()) {

      setMessage(
        "⚠️ Vui lòng nhập tên người phỏng vấn"
      );

      return;
    }


    if (!studentName.trim()) {

      setMessage(
        "⚠️ Vui lòng nhập tên sinh viên"
      );

      return;
    }


    if (!location) {

      setMessage(
        "⚠️ Vui lòng lấy vị trí GPS"
      );

      return;
    }


    setSaving(true);

    setMessage(
      "💾 Đang lưu khảo sát..."
    );


    const survey = {

      sessionId:
        generateSessionId(),

      interviewer,

      createdAt:
        new Date().toISOString(),


      latitude:
        location.latitude,

      longitude:
        location.longitude,

      accuracy:
        location.accuracy,


      studentName,

      studentId,

      faculty,

      year,


      q1,

      q2,

      q3:
        q3.join(", "),

      q4:
        q4.join(", "),

      q5,

      q6:
        q6.join(", "),

      q7:
        q7.join(", "),

      q8,


      // Lưu ảnh dạng Blob
      photo,


      syncStatus:
        "pending"

    };


    try {

      // Luôn lưu Local trước
      await addSurvey(survey);


      // Nếu Online → thử đồng bộ
      if (navigator.onLine) {

        try {

          await sendSurvey(
            survey
          );

          // Nếu thành công
          // cần cập nhật status
          const {
            updateSurvey
          } = await import(
            "../services/db"
          );


          await updateSurvey(
            survey.sessionId,
            {
              syncStatus:
                "synced",

              syncedAt:
                new Date().toISOString()
            }
          );


          setMessage(
            "✓ Đã lưu và đồng bộ lên Google Sheets"
          );

        } catch (error) {

          setMessage(
            "✓ Đã lưu Offline. Chờ đồng bộ khi có mạng."
          );

        }

      } else {

        setMessage(
          "✓ Đã lưu Offline. Sẽ tự động đồng bộ khi có mạng."
        );

      }


      setTimeout(() => {
        onBack();
      }, 1500);


    } catch (error) {

      console.error(error);

      setMessage(
        "❌ Không thể lưu khảo sát"
      );

    } finally {

      setSaving(false);

    }
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
            Tạo phiên khảo sát
          </h1>

          <p>
            VKU Student Employment Survey
          </p>
        </div>

      </div>


      {message && (
        <div className="message">
          {message}
        </div>
      )}


      <form
        className="survey-form"
        onSubmit={handleSubmit}
      >

        {/* Người phỏng vấn */}
        <section className="form-section">

          <h2>
            1. Người phỏng vấn
          </h2>


          <label>
            Họ và tên *
          </label>

          <input
            value={interviewer}
            onChange={e =>
              setInterviewer(
                e.target.value
              )
            }
            placeholder="Nhập tên người phỏng vấn"
          />

        </section>


        {/* Location */}
        <section className="form-section">

          <h2>
            2. Thời gian & vị trí
          </h2>


          <p>
            Thời gian:
            {" "}
            {new Date().toLocaleString(
              "vi-VN"
            )}
          </p>


          <button
            type="button"
            className="location-button"
            onClick={handleLocation}
            disabled={loadingLocation}
          >
            {loadingLocation
              ? "📍 Đang lấy..."
              : "📍 Lấy vị trí hiện tại"}
          </button>


          {location && (

            <div className="location-box">

              Latitude:
              {" "}
              {location.latitude}

              <br />

              Longitude:
              {" "}
              {location.longitude}

              <br />

              Accuracy:
              {" "}
              {Math.round(
                location.accuracy
              )} m

            </div>

          )}

        </section>


        {/* Sinh viên */}
        <section className="form-section">

          <h2>
            3. Thông tin sinh viên
          </h2>


          <label>
            Họ và tên *
          </label>

          <input
            value={studentName}
            onChange={e =>
              setStudentName(
                e.target.value
              )
            }
            placeholder="Nguyễn Văn A"
          />


          <label>
            MSSV
          </label>

          <input
            value={studentId}
            onChange={e =>
              setStudentId(
                e.target.value
              )
            }
            placeholder="221xxxx"
          />


          <label>
            Khoa
          </label>

          <select
            value={faculty}
            onChange={e =>
              setFaculty(
                e.target.value
              )
            }
          >

            <option value="">
              Chọn khoa
            </option>

            <option>
              Công nghệ thông tin
            </option>

            <option>
              Kinh tế số
            </option>

            <option>
              Du lịch
            </option>

            <option>
              Điện - Điện tử
            </option>

            <option>
              Khác
            </option>

          </select>


          <label>
            Năm học
          </label>

          <select
            value={year}
            onChange={e =>
              setYear(
                e.target.value
              )
            }
          >

            <option value="">
              Chọn năm
            </option>

            <option>
              Năm 1
            </option>

            <option>
              Năm 2
            </option>

            <option>
              Năm 3
            </option>

            <option>
              Năm 4
            </option>

          </select>

        </section>


        {/* Questions */}
        <section className="form-section">

          <h2>
            4. Khảo sát nhu cầu việc làm
          </h2>


          <label>
            Q1. Bạn đã từng đi làm thêm chưa?
          </label>

          <div className="radio-group">

            {[
              "Có",
              "Chưa"
            ].map(option => (

              <label
                key={option}
              >

                <input
                  type="radio"
                  name="q1"
                  value={option}
                  checked={
                    q1 === option
                  }
                  onChange={e =>
                    setQ1(
                      e.target.value
                    )
                  }
                />

                {option}

              </label>

            ))}

          </div>


          <label>
            Q2. Bạn có nhu cầu tìm việc trong 6 tháng tới?
          </label>

          <div className="radio-group">

            {[
              "Có",
              "Không",
              "Chưa xác định"
            ].map(option => (

              <label
                key={option}
              >

                <input
                  type="radio"
                  name="q2"
                  value={option}
                  checked={
                    q2 === option
                  }
                  onChange={e =>
                    setQ2(
                      e.target.value
                    )
                  }
                />

                {option}

              </label>

            ))}

          </div>


          <label>
            Q3. Hình thức việc làm mong muốn?
          </label>

          {[
            "Part-time",
            "Full-time",
            "Internship",
            "Freelance",
            "Remote"
          ].map(option => (

            <label
              className="checkbox-row"
              key={option}
            >

              <input
                type="checkbox"
                checked={
                  q3.includes(option)
                }
                onChange={() =>
                  handleMultiSelect(
                    option,
                    q3,
                    setQ3
                  )
                }
              />

              {option}

            </label>

          ))}


          <label>
            Q4. Lĩnh vực mong muốn?
          </label>

          {[
            "Software Developer",
            "Tester / QA",
            "AI / Machine Learning",
            "Data",
            "Marketing",
            "Business",
            "Khác"
          ].map(option => (

            <label
              className="checkbox-row"
              key={option}
            >

              <input
                type="checkbox"
                checked={
                  q4.includes(option)
                }
                onChange={() =>
                  handleMultiSelect(
                    option,
                    q4,
                    setQ4
                  )
                }
              />

              {option}

            </label>

          ))}


          <label>
            Q5. Mức thu nhập mong muốn?
          </label>

          <select
            value={q5}
            onChange={e =>
              setQ5(
                e.target.value
              )
            }
          >

            <option value="">
              Chọn mức thu nhập
            </option>

            <option>
              Dưới 3 triệu
            </option>

            <option>
              3 - 5 triệu
            </option>

            <option>
              5 - 8 triệu
            </option>

            <option>
              8 - 12 triệu
            </option>

            <option>
              Trên 12 triệu
            </option>

          </select>


          <label>
            Q6. Khó khăn khi tìm việc?
          </label>

          {[
            "Thiếu kinh nghiệm",
            "Thiếu kỹ năng",
            "Không biết tìm việc ở đâu",
            "CV chưa tốt",
            "Thiếu ngoại ngữ"
          ].map(option => (

            <label
              className="checkbox-row"
              key={option}
            >

              <input
                type="checkbox"
                checked={
                  q6.includes(option)
                }
                onChange={() =>
                  handleMultiSelect(
                    option,
                    q6,
                    setQ6
                  )
                }
              />

              {option}

            </label>

          ))}


          <label>
            Q7. Bạn mong muốn được hỗ trợ gì?
          </label>

          {[
            "Viết CV",
            "Luyện phỏng vấn",
            "Tìm Internship",
            "Định hướng nghề nghiệp",
            "Kỹ năng chuyên môn",
            "Tiếng Anh"
          ].map(option => (

            <label
              className="checkbox-row"
              key={option}
            >

              <input
                type="checkbox"
                checked={
                  q7.includes(option)
                }
                onChange={() =>
                  handleMultiSelect(
                    option,
                    q7,
                    setQ7
                  )
                }
              />

              {option}

            </label>

          ))}


          <label>
            Q8. Ý kiến khác
          </label>

          <textarea
            value={q8}
            onChange={e =>
              setQ8(
                e.target.value
              )
            }
            rows="4"
            placeholder="Nhập ý kiến của sinh viên..."
          />

        </section>


        {/* Camera */}
        <section className="form-section">

          <h2>
            5. Hình ảnh hiện trường
          </h2>


          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
          />


          {photo && (

            <div className="photo-preview">

              <img
                src={URL.createObjectURL(
                  photo
                )}
                alt="Survey"
              />

            </div>

          )}

        </section>


        <button
          type="submit"
          className="submit-button"
          disabled={saving}
        >

          {saving
            ? "💾 Đang lưu..."
            : "✓ Lưu phiên khảo sát"}

        </button>

      </form>

    </div>
  );
}