import { createElement, type ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export function renderManagementRoute(
  element: ReactElement,
  initialEntry = "/app/importacoes-mms",
  path = "/app/importacoes-mms",
) {
  return render(createElement(
    MemoryRouter,
    { initialEntries: [initialEntry] },
    createElement(Routes, null, createElement(Route, { path, element })),
  ));
}
