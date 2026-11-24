import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
  window.history.replaceState({}, "", "/");
});

test("a destination suggestion and custom interest produce a day-by-day plan", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({
    plan: "## Dia 1 — Centro\n**Manhã**: [Museu](https://example.com/museu)\n<img src=x />",
  }) });
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Planejar viagem para Paris" }));
  fireEvent.click(screen.getByRole("button", { name: "Cultura", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Outro interesse" }));
  fireEvent.change(screen.getByLabelText("Outro interesse"), { target: { value: "Jazz" } });
  fireEvent.click(screen.getByRole("button", { name: "Gerar meu roteiro" }));
  expect(await screen.findByRole("heading", { name: "Dia 1 — Centro" })).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
    destination: "Paris", days: 3, language: "PT-BR", interests: "Cultura, Jazz",
  });
  expect(screen.getByRole("link", { name: "Museu" })).toHaveAttribute("href", "https://example.com/museu");
  expect(document.querySelector("#trip-plan img")).toBeNull();
  expect(screen.getByRole("button", { name: "Baixar PDF" })).toBeEnabled();
});

test("French and English routes share the form and keep the destination on language change", () => {
  window.history.replaceState({}, "", "/fr");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Planifiez votre voyage" })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Lyon" } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "EN" } });
  expect(screen.getByRole("heading", { name: "Plan your trip" })).toBeInTheDocument();
  expect(screen.getByLabelText("Destination")).toHaveValue("Lyon");
});

test("a rate-limited request shows an error and can be retried", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
  render(<App />);
  fireEvent.change(screen.getByLabelText("Destino"), { target: { value: "Salvador" } });
  fireEvent.click(screen.getByRole("button", { name: "Gerar meu roteiro" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("alta demanda"));
  expect(screen.getByRole("button", { name: "Gerar meu roteiro" })).toBeEnabled();
  expect(screen.getByLabelText("Destino")).toHaveValue("Salvador");
});
