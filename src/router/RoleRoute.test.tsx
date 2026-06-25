import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/api";

// ── Helpers ────────────────────────────────────────────────────────────────

function renderWithRole(role: UserRole | null, allowed: UserRole[]) {
  useAuthStore.setState({
    accessToken: role ? "token" : null,
    username: "",
    role,
    userId: null,
  });

  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/" element={<div>Tableau</div>} />
        <Route element={<RoleRoute allowed={allowed} />}>
          <Route path="/admin" element={<div>Zone admin</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// ── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    username: "",
    role: null,
    userId: null,
  });
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("RoleRoute", () => {
  it("rend le contenu quand le rôle est autorisé (ADMIN)", () => {
    renderWithRole("ADMIN", ["ADMIN"]);
    expect(screen.getByText("Zone admin")).toBeInTheDocument();
    expect(screen.queryByText("Tableau")).not.toBeInTheDocument();
  });

  it("rend le contenu quand plusieurs rôles sont autorisés et le rôle correspond", () => {
    renderWithRole("FOREMAN", ["ADMIN", "FOREMAN"]);
    expect(screen.getByText("Zone admin")).toBeInTheDocument();
  });

  it("redirige vers / quand le rôle n'est pas dans la liste", () => {
    renderWithRole("EMPLOYEE", ["ADMIN"]);
    expect(screen.getByText("Tableau")).toBeInTheDocument();
    expect(screen.queryByText("Zone admin")).not.toBeInTheDocument();
  });

  it("redirige vers / quand le rôle est null (non authentifié)", () => {
    renderWithRole(null, ["ADMIN"]);
    expect(screen.getByText("Tableau")).toBeInTheDocument();
    expect(screen.queryByText("Zone admin")).not.toBeInTheDocument();
  });

  it("redirige un FOREMAN vers / sur une route ADMIN uniquement", () => {
    renderWithRole("FOREMAN", ["ADMIN"]);
    expect(screen.getByText("Tableau")).toBeInTheDocument();
  });

  it("redirige un EMPLOYEE vers / sur une route ADMIN uniquement", () => {
    renderWithRole("EMPLOYEE", ["ADMIN"]);
    expect(screen.getByText("Tableau")).toBeInTheDocument();
  });

  it("autorise EMPLOYEE quand EMPLOYEE est dans la liste", () => {
    renderWithRole("EMPLOYEE", ["FOREMAN", "EMPLOYEE"]);
    expect(screen.getByText("Zone admin")).toBeInTheDocument();
  });

  it("autorise tous les rôles quand la liste les contient tous", () => {
    const all: UserRole[] = ["ADMIN", "FOREMAN", "EMPLOYEE"];
    renderWithRole("EMPLOYEE", all);
    expect(screen.getByText("Zone admin")).toBeInTheDocument();
  });
});
