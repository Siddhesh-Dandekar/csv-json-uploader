import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [ageDistribution, setAgeDistribution] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
    setAgeDistribution(null);
    setParsedData(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("csv", file);

    try {
      const response = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }
      const result = await response.json();
      setParsedData(result.data);
      setAgeDistribution(result.ageDistribution);
      setStatus("Upload and processing successful!");
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h2>CSV to JSON Uploader & Report</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button style={{ marginLeft: "10px" }} onClick={handleUpload}>
        Upload
      </button>
      <div style={{ marginTop: "20px", color: "blue" }}>{status}</div>
      {ageDistribution && (
        <div style={{ marginTop: "20px" }}>
          <h3>Age Group Distribution</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Age Group</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ageDistribution).map(([group, count]) => (
                <tr key={group}>
                  <td>{group}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {parsedData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Sample Parsed Data</h3>
          <pre>{JSON.stringify(parsedData.slice(0, 3), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
