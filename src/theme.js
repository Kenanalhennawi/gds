export const setTheme = ({ themeToggleLabel }, t) => {
  const theme = t === "light" || t === "dark" ? t : "dark";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("gdsTheme", theme);
  themeToggleLabel.textContent = theme === "dark" ? "Dark" : "Light";
};

export const toggleTheme = ({ themeToggleLabel }) => {
  const cur = document.documentElement.dataset.theme || "dark";
  setTheme({ themeToggleLabel }, cur === "dark" ? "light" : "dark");
};
