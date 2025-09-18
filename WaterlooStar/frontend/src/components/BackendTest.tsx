import React, { useState, useRef } from "react";
import { useDraggable } from "../Reusable_hook/useDraggable";

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  useDraggable(panelRef, ".panel-handle", "pos:backend-test");

  const testBackend = async () => {
    setLoading(true);
    setTestResult("Testing backend connection...");

    try {
      console.log("🧪 Testing backend connection...");
      const response = await fetch("http://localhost:8080/api/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        setTestResult(
          `✅ Backend is working! Message: ${data.message}, Time: ${data.timestamp}`
        );
      } else {
        setTestResult(
          `❌ Backend responded with error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Backend test error:", error);
      setTestResult(
        `❌ Cannot connect to backend: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setTestResult("Testing registration...");

    const testData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      confirm_password: "password123",
    };

    try {
      console.log("🧪 Testing registration with data:", testData);
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Registration response status:", response.status);
      console.log("Registration response headers:", [
        ...response.headers.entries(),
      ]);

      const data = await response.json();
      console.log("Registration response data:", data);

      if (response.ok) {
        setTestResult(`✅ Registration successful! Message: ${data.message}`);
      } else {
        setTestResult(
          `❌ Registration failed: ${data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Registration test error:", error);
      setTestResult(
        `❌ Registration network error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        background: "white",
        padding: "1rem",
        border: "2px solid #d4a574",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 9999,
        maxWidth: "400px",
      }}
    >
      {/* ✅ simple drag handle */}
      <div
        className="panel-handle"
        style={{
          background: "#faf6e8",
          padding: "0.25rem 0.5rem",
          cursor: "move",
          userSelect: "none",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: "#8b6914",
        }}
      >
        Backend Test
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={testBackend}
          disabled={loading}
          style={{
            background: "#d4a574",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginRight: "0.5rem",
          }}
        >
          Test Connection
        </button>

        <button
          onClick={testRegistration}
          disabled={loading}
          style={{
            background: "#b8860b",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Test Registration
        </button>
      </div>

      <div
        style={{
          background: "#faf6e8",
          padding: "0.5rem",
          borderRadius: "4px",
          fontSize: "0.9rem",
          minHeight: "40px",
          border: "1px solid #e8d5a3",
        }}
      >
        {testResult || "Click a button to test the backend"}
      </div>

      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#666" }}>
        Check browser console (F12) for detailed logs
      </div>
    </div>
  );
};

export default BackendTest;
