import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/Button"

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "var(--color-terracotta)",
          marginBottom: "20px",
        }}
      >
        ✦
      </div>
      <h1
        className="font-serif"
        style={{
          fontSize: "36px",
          fontWeight: 500,
          marginBottom: "10px",
          color: "var(--color-text-main)",
        }}
      >
        Quiet wanderer
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "var(--color-text-muted)",
          maxWidth: "420px",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        This page does not exist in your journal. Take a gentle step back to return to your tasks.
      </p>
      <Link to="/tasks" style={{ textDecoration: "none" }}>
        <Button variant="primary">Return to journal →</Button>
      </Link>
    </div>
  )
}
