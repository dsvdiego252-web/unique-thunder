import React from "react";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        👕 Unique Thunder
      </h1>
      <p style={{ fontSize: "1.2rem", textAlign: "center", maxWidth: "600px" }}>
        Bem-vindo à loja oficial da <strong>Unique Thunder</strong> —
        o novo conceito em camisetas exclusivas.
      </p>
      <a
        href="#"
        style={{
          marginTop: "2rem",
          backgroundColor: "#ff007f",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Ver Coleção
      </a>
    </div>
  );
}
// Interface principal (já definida anteriormente, substituída no deploy)
